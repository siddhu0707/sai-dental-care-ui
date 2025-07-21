import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { BillingService } from '../../services/billing.service';
import { PatientService } from '../../services/patient.service';
import { PatientBalanceService } from '../../services/patient-balance.service';
import { Bill, CreateBillRequest, BillStatus, PaymentMethod, ServiceTemplate, ServiceCategory, BillItem, Payment } from '../../models/billing.model';
import { Patient } from '../../models/patient.model';
import { PatientBalance, PatientPaymentSummary } from '../../models/patient-balance.model';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="billing-container">
      <header class="billing-header">
        <div class="header-left">
          <h1 class="page-title">Billing & Payments</h1>
          <p class="page-subtitle">Manage bills, payments, and invoices</p>
        </div>
        <div class="header-right">
          <button (click)="showCreateBillModal = true" class="create-bill-btn">
            <span class="btn-icon">📄</span>
            Create New Bill
          </button>
        </div>
      </header>
      
      <div class="billing-stats">
        <div class="stat-card revenue">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3 class="stat-value">\${{ monthlyRevenue | number:'1.2-2' }}</h3>
            <p class="stat-label">Monthly Revenue</p>
          </div>
        </div>
        
        <div class="stat-card outstanding">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <h3 class="stat-value">\${{ outstandingAmount | number:'1.2-2' }}</h3>
            <p class="stat-label">Outstanding Amount</p>
          </div>
        </div>
        
        <div class="stat-card pending">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <h3 class="stat-value">{{ pendingBills.length }}</h3>
            <p class="stat-label">Pending Bills</p>
          </div>
        </div>
        
        <div class="stat-card overdue">
          <div class="stat-icon">���️</div>
          <div class="stat-content">
            <h3 class="stat-value">{{ overdueBills.length }}</h3>
            <p class="stat-label">Overdue Bills</p>
          </div>
        </div>
      </div>
      
      <div class="billing-tabs">
        <button 
          *ngFor="let tab of tabs" 
          (click)="activeTab = tab.key"
          [class.active]="activeTab === tab.key"
          class="tab-button"
        >
          {{ tab.label }}
        </button>
      </div>
      
      <div class="billing-content">
        <!-- All Bills Tab -->
        <div *ngIf="activeTab === 'bills'" class="tab-content">
          <div class="bills-controls">
            <div class="search-container">
              <input 
                type="text" 
                placeholder="Search by patient name or bill number..."
                [(ngModel)]="searchQuery"
                (input)="filterBills()"
                class="search-input"
              >
              <span class="search-icon">🔍</span>
            </div>
            
            <div class="filter-container">
              <select [(ngModel)]="statusFilter" (change)="filterBills()" class="filter-select">
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div class="bills-table">
            <div class="table-header">
              <div class="header-cell">Bill Number</div>
              <div class="header-cell">Patient</div>
              <div class="header-cell">Issue Date</div>
              <div class="header-cell">Due Date</div>
              <div class="header-cell">Amount</div>
              <div class="header-cell">Status</div>
              <div class="header-cell">Actions</div>
            </div>
            
            <div *ngFor="let bill of filteredBills" class="table-row">
              <div class="table-cell">
                <strong>{{ bill.billNumber }}</strong>
              </div>
              <div class="table-cell">{{ bill.patientName }}</div>
              <div class="table-cell">{{ bill.issueDate | date:'MMM d, y' }}</div>
              <div class="table-cell">{{ bill.dueDate | date:'MMM d, y' }}</div>
              <div class="table-cell">
                <strong>\${{ bill.total | number:'1.2-2' }}</strong>
              </div>
              <div class="table-cell">
                <span class="status-badge" [class]="bill.status">
                  {{ bill.status | titlecase }}
                </span>
              </div>
              <div class="table-cell">
                <div class="action-buttons">
                  <button (click)="viewBill(bill)" class="action-btn view">View</button>
                  <button *ngIf="bill.status === 'draft'" (click)="editBill(bill)" class="action-btn edit">Edit</button>
                  <button *ngIf="bill.status === 'draft'" (click)="sendBill(bill.id)" class="action-btn send">Send</button>
                  <button *ngIf="bill.status === 'sent' || bill.status === 'overdue'" 
                          (click)="markAsPaid(bill)" class="action-btn pay">Mark Paid</button>
                  <button (click)="downloadBill(bill)" class="action-btn download">Download</button>
                </div>
              </div>
            </div>
            
            <div *ngIf="filteredBills.length === 0" class="empty-state">
              <div class="empty-icon">📄</div>
              <h3>No bills found</h3>
              <p>{{ searchQuery || statusFilter ? 'Try adjusting your search criteria' : 'Create your first bill' }}</p>
            </div>
          </div>
        </div>
        
        <!-- Payments Tab -->
        <div *ngIf="activeTab === 'payments'" class="tab-content">
          <div class="payments-list">
            <h3>Recent Payments</h3>
            <div class="payment-item" *ngFor="let payment of payments">
              <div class="payment-info">
                <h4>{{ getBillByPayment(payment.billId)?.patientName }}</h4>
                <p>Bill: {{ getBillByPayment(payment.billId)?.billNumber }}</p>
                <p>Reference: {{ payment.reference }}</p>
              </div>
              <div class="payment-details">
                <div class="payment-amount">\${{ payment.amount | number:'1.2-2' }}</div>
                <div class="payment-method">{{ payment.method | titlecase }}</div>
                <div class="payment-date">{{ payment.date | date:'MMM d, y' }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Patient Balances Tab -->
        <div *ngIf="activeTab === 'balances'" class="tab-content">
          <div class="balances-summary">
            <div class="summary-stats">
              <div class="summary-card">
                <h3>Total Outstanding</h3>
                <div class="summary-amount outstanding">
                  \${{ patientBalances.reduce(getOutstandingTotal, 0) | number:'1.2-2' }}
                </div>
              </div>
              <div class="summary-card">
                <h3>Patients with Balance</h3>
                <div class="summary-count">
                  {{ patientBalances.filter(b => b.remainingBalance > 0).length }}
                </div>
              </div>
            </div>
          </div>

          <div class="patient-balances-list">
            <div class="balances-header">
              <h3>Patient Outstanding Balances</h3>
            </div>

            <div class="balances-table">
              <div class="table-header">
                <div class="header-cell">Patient</div>
                <div class="header-cell">Total Billed</div>
                <div class="header-cell">Total Paid</div>
                <div class="header-cell">Remaining</div>
                <div class="header-cell">Last Payment</div>
                <div class="header-cell">Actions</div>
              </div>

              <div *ngFor="let balance of patientBalances.filter(b => b.remainingBalance > 0)" class="table-row">
                <div class="table-cell">
                  <strong>{{ balance.patientName }}</strong>
                </div>
                <div class="table-cell">
                  \${{ balance.totalBilled | number:'1.2-2' }}
                </div>
                <div class="table-cell">
                  \${{ balance.totalPaid | number:'1.2-2' }}
                </div>
                <div class="table-cell">
                  <span class="balance-amount outstanding">
                    \${{ balance.remainingBalance | number:'1.2-2' }}
                  </span>
                </div>
                <div class="table-cell">
                  <span *ngIf="balance.lastPaymentDate; else noPayment">
                    {{ balance.lastPaymentDate | date:'MMM d, y' }}
                  </span>
                  <ng-template #noPayment>
                    <span class="no-data">No payments</span>
                  </ng-template>
                </div>
                <div class="table-cell">
                  <button (click)="viewPatientBills(balance.patientId)" class="action-btn view">
                    View Bills
                  </button>
                  <button (click)="createPaymentPlan(balance)" class="action-btn primary">
                    Payment Plan
                  </button>
                </div>
              </div>

              <div *ngIf="patientBalances.filter(b => b.remainingBalance > 0).length === 0" class="empty-state">
                <div class="empty-icon">💳</div>
                <h3>All Paid Up!</h3>
                <p>All patients have cleared their outstanding balances.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Service Templates Tab -->
        <div *ngIf="activeTab === 'templates'" class="tab-content">
          <div class="templates-header">
            <h3>Service Templates</h3>
            <button (click)="showTemplateModal = true" class="add-template-btn">
              Add Template
            </button>
          </div>
          
          <div class="templates-grid">
            <div *ngFor="let template of serviceTemplates" class="template-card">
              <div class="template-header">
                <h4>{{ template.name }}</h4>
                <span class="template-category">{{ template.category | titlecase }}</span>
              </div>
              <p class="template-description">{{ template.description }}</p>
              <div class="template-price">\${{ template.defaultPrice | number:'1.2-2' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create/Edit Bill Modal -->
    <div *ngIf="showCreateBillModal || showEditBillModal" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ showCreateBillModal ? 'Create New Bill' : 'Edit Bill' }}</h2>
          <button (click)="closeModal()" class="close-btn">✕</button>
        </div>
        
        <form [formGroup]="billForm" (ngSubmit)="onSubmitBill()" class="bill-form">
          <div class="form-section">
            <div class="form-grid">
              <div class="form-group">
                <label>Patient *</label>
                <select formControlName="patientId" class="form-input">
                  <option value="">Select Patient</option>
                  <option *ngFor="let patient of patients" [value]="patient.id">
                    {{ patient.firstName }} {{ patient.lastName }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Discount (\$)</label>
                <input type="number" formControlName="discount" class="form-input" min="0" step="0.01" />
              </div>
            </div>
            
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea formControlName="notes" class="form-textarea" 
                       placeholder="Additional notes for this bill"></textarea>
            </div>
          </div>
          
          <div class="form-section">
            <div class="section-header">
              <h3>Bill Items</h3>
              <button type="button" (click)="addBillItem()" class="add-item-btn">
                Add Item
              </button>
            </div>
            
            <div formArrayName="items" class="items-list">
              <div *ngFor="let item of billItems.controls; let i = index" [formGroupName]="i" class="item-row">
                <div class="item-grid">
                  <div class="form-group">
                    <label>Service</label>
                    <select formControlName="description" (change)="onServiceSelect(i)" class="form-input">
                      <option value="">Select Service</option>
                      <option *ngFor="let template of serviceTemplates" [value]="template.name">
                        {{ template.name }}
                      </option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label>Category</label>
                    <select formControlName="category" class="form-input">
                      <option *ngFor="let category of serviceCategories" [value]="category">
                        {{ category | titlecase }}
                      </option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" formControlName="quantity" class="form-input" min="1" (input)="calculateItemTotal(i)" />
                  </div>
                  
                  <div class="form-group">
                    <label>Unit Price (\$)</label>
                    <input type="number" formControlName="unitPrice" class="form-input" min="0" step="0.01" (input)="calculateItemTotal(i)" />
                  </div>
                  
                  <div class="form-group">
                    <label>Total</label>
                    <div class="total-display">\${{ getItemTotal(i) | number:'1.2-2' }}</div>
                  </div>
                  
                  <div class="form-group">
                    <button type="button" (click)="removeBillItem(i)" class="remove-item-btn">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bill-summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>\${{ calculateSubtotal() | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row">
              <span>Tax (8%):</span>
              <span>\${{ calculateTax() | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row">
              <span>Discount:</span>
              <span>-\${{ billForm.get('discount')?.value || 0 | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>\${{ calculateTotal() | number:'1.2-2' }}</span>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" (click)="closeModal()" class="btn secondary">Cancel</button>
            <button type="submit" [disabled]="billForm.invalid || billItems.length === 0" class="btn primary">
              {{ showCreateBillModal ? 'Create Bill' : 'Update Bill' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- View Bill Modal -->
    <div *ngIf="showViewBillModal" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Bill Details</h2>
          <button (click)="closeModal()" class="close-btn">✕</button>
        </div>
        
        <div *ngIf="selectedBill" class="bill-details">
          <div class="bill-header">
            <div class="clinic-info">
              <h3>Sai Dental Care</h3>
              <p>123 Main Street<br>City, State 12345<br>Phone: (555) 123-4567</p>
            </div>
            <div class="bill-info">
              <h2>{{ selectedBill.billNumber }}</h2>
              <p><strong>Issue Date:</strong> {{ selectedBill.issueDate | date:'fullDate' }}</p>
              <p><strong>Due Date:</strong> {{ selectedBill.dueDate | date:'fullDate' }}</p>
              <div class="status-badge large" [class]="selectedBill.status">
                {{ selectedBill.status | titlecase }}
              </div>
            </div>
          </div>
          
          <div class="patient-info">
            <h4>Bill To:</h4>
            <p><strong>{{ selectedBill.patientName }}</strong></p>
          </div>
          
          <div class="bill-items-table">
            <div class="items-header">
              <div>Description</div>
              <div>Category</div>
              <div>Qty</div>
              <div>Unit Price</div>
              <div>Total</div>
            </div>
            
            <div *ngFor="let item of selectedBill.items" class="items-row">
              <div>{{ item.description }}</div>
              <div>{{ item.category | titlecase }}</div>
              <div>{{ item.quantity }}</div>
              <div>\${{ item.unitPrice | number:'1.2-2' }}</div>
              <div>\${{ item.total | number:'1.2-2' }}</div>
            </div>
          </div>
          
          <div class="bill-totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>\${{ selectedBill.subtotal | number:'1.2-2' }}</span>
            </div>
            <div class="totals-row">
              <span>Tax:</span>
              <span>\${{ selectedBill.tax | number:'1.2-2' }}</span>
            </div>
            <div *ngIf="selectedBill.discount > 0" class="totals-row">
              <span>Discount:</span>
              <span>-\${{ selectedBill.discount | number:'1.2-2' }}</span>
            </div>
            <div class="totals-row total">
              <strong>Total: \${{ selectedBill.total | number:'1.2-2' }}</strong>
            </div>
          </div>
          
          <div *ngIf="selectedBill.notes" class="bill-notes">
            <h4>Notes:</h4>
            <p>{{ selectedBill.notes }}</p>
          </div>
          
          <div class="bill-actions">
            <button (click)="downloadBill(selectedBill)" class="btn secondary">Download PDF</button>
            <button *ngIf="selectedBill.status === 'sent' || selectedBill.status === 'overdue'" 
                    (click)="markAsPaid(selectedBill)" class="btn primary">Mark as Paid</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Payment Modal -->
    <div *ngIf="showPaymentModal" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Record Payment</h2>
          <button (click)="closeModal()" class="close-btn">✕</button>
        </div>
        
        <form [formGroup]="paymentForm" (ngSubmit)="onSubmitPayment()" class="payment-form">
          <div class="form-group">
            <label>Amount (\$) *</label>
            <input type="number" formControlName="amount" class="form-input" 
                   [max]="selectedBill?.total || 0" min="0" step="0.01" />
            <small *ngIf="selectedBill">Total bill amount: \${{ selectedBill.total | number:'1.2-2' }}</small>
          </div>
          
          <div class="form-group">
            <label>Payment Method *</label>
            <select formControlName="method" class="form-input">
              <option value="">Select Payment Method</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="check">Check</option>
              <option value="insurance">Insurance</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
          
          <div class="form-actions">
            <button type="button" (click)="closeModal()" class="btn secondary">Cancel</button>
            <button type="submit" [disabled]="paymentForm.invalid" class="btn primary">
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Service Template Modal -->
    <div *ngIf="showTemplateModal" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Add Service Template</h2>
          <button (click)="closeModal()" class="close-btn">✕</button>
        </div>
        
        <form [formGroup]="templateForm" (ngSubmit)="onSubmitTemplate()" class="template-form">
          <div class="form-group">
            <label>Service Name *</label>
            <input type="text" formControlName="name" class="form-input" />
          </div>
          
          <div class="form-group">
            <label>Category *</label>
            <select formControlName="category" class="form-input">
              <option value="">Select Category</option>
              <option *ngFor="let category of serviceCategories" [value]="category">
                {{ category | titlecase }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Default Price (\$) *</label>
            <input type="number" formControlName="defaultPrice" class="form-input" min="0" step="0.01" />
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <textarea formControlName="description" class="form-textarea"></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" (click)="closeModal()" class="btn secondary">Cancel</button>
            <button type="submit" [disabled]="templateForm.invalid" class="btn primary">
              Add Template
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .billing-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .billing-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }
    
    .page-title {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .page-subtitle {
      margin: 0.5rem 0 0 0;
      color: #6b7280;
      font-size: 1rem;
    }
    
    .create-bill-btn {
      background: #f59e0b;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: background 0.2s ease;
    }
    
    .create-bill-btn:hover {
      background: #d97706;
    }
    
    .btn-icon {
      margin-right: 0.5rem;
    }
    
    .billing-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      transition: transform 0.2s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .stat-icon {
      font-size: 2.5rem;
      margin-right: 1rem;
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .stat-card.revenue .stat-icon { background: #dcfce7; }
    .stat-card.outstanding .stat-icon { background: #fef3c7; }
    .stat-card.pending .stat-icon { background: #dbeafe; }
    .stat-card.overdue .stat-icon { background: #fee2e2; }
    
    .stat-value {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
    }
    
    .stat-label {
      margin: 0.25rem 0 0 0;
      color: #6b7280;
      font-size: 0.9rem;
    }
    
    .billing-tabs {
      display: flex;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 2rem;
    }
    
    .tab-button {
      padding: 1rem 1.5rem;
      border: none;
      background: none;
      color: #6b7280;
      font-weight: 500;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
    }
    
    .tab-button:hover {
      color: #374151;
    }
    
    .tab-button.active {
      color: #f59e0b;
      border-bottom-color: #f59e0b;
    }
    
    .bills-controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      align-items: center;
    }
    
    .search-container {
      flex: 1;
      position: relative;
    }
    
    .search-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 1rem;
    }
    
    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7280;
    }
    
    .filter-select {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      background: white;
    }
    
    .bills-table {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .table-header {
      display: grid;
      grid-template-columns: 150px 200px 120px 120px 120px 120px 200px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .header-cell {
      padding: 1rem;
      font-weight: 600;
      color: #374151;
    }
    
    .table-row {
      display: grid;
      grid-template-columns: 150px 200px 120px 120px 120px 120px 200px;
      border-bottom: 1px solid #e5e7eb;
      transition: background 0.2s ease;
    }
    
    .table-row:hover {
      background: #f9fafb;
    }
    
    .table-cell {
      padding: 1rem;
      display: flex;
      align-items: center;
    }
    
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: capitalize;
    }
    
    .status-badge.draft {
      background: #f3f4f6;
      color: #374151;
    }
    
    .status-badge.sent {
      background: #dbeafe;
      color: #2563eb;
    }
    
    .status-badge.paid {
      background: #dcfce7;
      color: #16a34a;
    }
    
    .status-badge.overdue {
      background: #fee2e2;
      color: #dc2626;
    }
    
    .status-badge.cancelled {
      background: #f3f4f6;
      color: #6b7280;
    }
    
    .status-badge.large {
      padding: 0.5rem 1rem;
      font-size: 1rem;
    }
    
    .action-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .action-btn {
      padding: 0.375rem 0.75rem;
      border: none;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .action-btn.view {
      background: #e5e7eb;
      color: #374151;
    }
    
    .action-btn.edit {
      background: #fef3c7;
      color: #d97706;
    }
    
    .action-btn.send {
      background: #dbeafe;
      color: #2563eb;
    }
    
    .action-btn.pay {
      background: #dcfce7;
      color: #16a34a;
    }
    
    .action-btn.download {
      background: #e0e7ff;
      color: #4338ca;
    }
    
    .action-btn:hover {
      opacity: 0.8;
    }
    
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6b7280;
    }
    
    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    
    .payments-list h3 {
      margin-bottom: 1.5rem;
      color: #1f2937;
    }
    
    .payment-item {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .payment-info h4 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
    }
    
    .payment-info p {
      margin: 0.25rem 0;
      color: #6b7280;
      font-size: 0.9rem;
    }
    
    .payment-details {
      text-align: right;
    }
    
    .payment-amount {
      font-size: 1.25rem;
      font-weight: 600;
      color: #16a34a;
    }
    
    .payment-method {
      color: #6b7280;
      font-size: 0.9rem;
    }
    
    .payment-date {
      color: #9ca3af;
      font-size: 0.8rem;
    }
    
    .templates-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .templates-header h3 {
      margin: 0;
      color: #1f2937;
    }
    
    .add-template-btn {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
    }
    
    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .template-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
    }
    
    .template-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .template-header h4 {
      margin: 0;
      color: #1f2937;
    }
    
    .template-category {
      background: #e5e7eb;
      color: #374151;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    
    .template-description {
      color: #6b7280;
      margin: 0 0 1rem 0;
      line-height: 1.5;
    }
    
    .template-price {
      font-size: 1.25rem;
      font-weight: 600;
      color: #16a34a;
    }
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
    }
    
    .modal-content {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }
    
    .modal-content.large {
      max-width: 900px;
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
      padding: 0.25rem;
    }
    
    .close-btn:hover {
      color: #374151;
    }
    
    .bill-form,
    .payment-form,
    .template-form {
      padding: 1.5rem;
    }
    
    .form-section {
      margin-bottom: 2rem;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .section-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .add-item-btn {
      background: #10b981;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
    }
    
    .form-group.full-width {
      grid-column: 1 / -1;
    }
    
    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }
    
    .form-input,
    .form-textarea {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }
    
    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #f59e0b;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
    }
    
    .form-textarea {
      min-height: 80px;
      resize: vertical;
    }
    
    .items-list {
      margin-top: 1rem;
    }
    
    .item-row {
      background: #f9fafb;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    
    .item-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 80px 120px 120px 80px;
      gap: 1rem;
      align-items: end;
    }
    
    .total-display {
      padding: 0.75rem;
      background: #e5e7eb;
      border-radius: 6px;
      font-weight: 600;
      color: #374151;
    }
    
    .remove-item-btn {
      background: #fee2e2;
      color: #dc2626;
      border: none;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    
    .bill-summary {
      background: #f9fafb;
      border-radius: 8px;
      padding: 1.5rem;
      margin-top: 2rem;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    
    .summary-row.total {
      font-size: 1.1rem;
      font-weight: 600;
      border-top: 1px solid #d1d5db;
      padding-top: 0.5rem;
      margin-top: 0.5rem;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn.primary {
      background: #f59e0b;
      color: white;
      border: none;
    }
    
    .btn.primary:hover:not(:disabled) {
      background: #d97706;
    }
    
    .btn.primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
    
    .btn.secondary {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }
    
    .btn.secondary:hover {
      background: #e5e7eb;
    }
    
    .bill-details {
      padding: 1.5rem;
    }
    
    .bill-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .clinic-info h3 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
    }
    
    .clinic-info p {
      margin: 0;
      color: #6b7280;
      line-height: 1.5;
    }
    
    .bill-info {
      text-align: right;
    }
    
    .bill-info h2 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
    }
    
    .bill-info p {
      margin: 0.25rem 0;
      color: #6b7280;
    }
    
    .patient-info {
      margin-bottom: 2rem;
    }
    
    .patient-info h4 {
      margin: 0 0 0.5rem 0;
      color: #374151;
    }
    
    .patient-info p {
      margin: 0;
      color: #1f2937;
    }
    
    .bill-items-table {
      margin-bottom: 2rem;
    }
    
    .items-header {
      display: grid;
      grid-template-columns: 2fr 1fr 80px 120px 120px;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px 8px 0 0;
      font-weight: 600;
      color: #374151;
    }
    
    .items-row {
      display: grid;
      grid-template-columns: 2fr 1fr 80px 120px 120px;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .bill-totals {
      background: #f9fafb;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .totals-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    
    .totals-row.total {
      font-size: 1.25rem;
      border-top: 1px solid #d1d5db;
      padding-top: 0.75rem;
      margin-top: 0.75rem;
    }
    
    .bill-notes {
      background: #f9fafb;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 2rem;
    }
    
    .bill-notes h4 {
      margin: 0 0 0.5rem 0;
      color: #374151;
    }
    
    .bill-notes p {
      margin: 0;
      color: #6b7280;
      line-height: 1.5;
    }
    
    .bill-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }
    
    @media (max-width: 1024px) {
      .table-header,
      .table-row {
        grid-template-columns: 1fr;
        gap: 0;
      }
      
      .table-cell {
        padding: 0.5rem 1rem;
        border-bottom: 1px solid #f3f4f6;
      }
      
      .header-cell {
        display: none;
      }
      
      .table-cell:before {
        content: attr(data-label);
        font-weight: 600;
        display: inline-block;
        width: 120px;
        color: #374151;
      }
    }
    
    @media (max-width: 768px) {
      .billing-container {
        padding: 1rem;
      }
      
      .billing-header {
        flex-direction: column;
        gap: 1rem;
      }
      
      .billing-stats {
        grid-template-columns: 1fr;
      }
      
      .bills-controls {
        flex-direction: column;
      }
      
      .form-grid {
        grid-template-columns: 1fr;
      }
      
      .item-grid {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
      
      .modal-overlay {
        padding: 1rem;
      }
      
      .bill-header {
        flex-direction: column;
        gap: 1rem;
      }
      
      .bill-info {
        text-align: left;
      }
      
      .items-header,
      .items-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
    }
  `]
})
export class BillingComponent implements OnInit {
  activeTab = 'bills';
  tabs = [
    { key: 'bills', label: 'All Bills' },
    { key: 'payments', label: 'Payments' },
    { key: 'balances', label: 'Patient Balances' },
    { key: 'templates', label: 'Service Templates' }
  ];

  bills: Bill[] = [];
  filteredBills: Bill[] = [];
  payments: Payment[] = [];
  patients: Patient[] = [];
  serviceTemplates: ServiceTemplate[] = [];
  patientBalances: PatientBalance[] = [];
  patientPaymentSummaries: PatientPaymentSummary[] = [];
  
  searchQuery = '';
  statusFilter = '';
  
  monthlyRevenue = 0;
  outstandingAmount = 0;
  pendingBills: Bill[] = [];
  overdueBills: Bill[] = [];
  
  showCreateBillModal = false;
  showEditBillModal = false;
  showViewBillModal = false;
  showPaymentModal = false;
  showTemplateModal = false;
  
  selectedBill: Bill | null = null;
  editingBill: Bill | null = null;
  
  billForm: FormGroup;
  paymentForm: FormGroup;
  templateForm: FormGroup;
  
  serviceCategories = Object.values(ServiceCategory);
  paymentMethods = Object.values(PaymentMethod);

  constructor(
    private billingService: BillingService,
    private patientService: PatientService,
    private patientBalanceService: PatientBalanceService,
    private fb: FormBuilder
  ) {
    this.billForm = this.createBillForm();
    this.paymentForm = this.createPaymentForm();
    this.templateForm = this.createTemplateForm();
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.billingService.getBills().subscribe(bills => {
      this.bills = bills;
      this.filterBills();
      this.updateStats();
    });

    this.billingService.payments$.subscribe((payments: Payment[]) => {
      this.payments = payments;
    });

    this.billingService.getServiceTemplates().subscribe(templates => {
      this.serviceTemplates = templates;
    });

    this.patientService.getPatients().subscribe(patients => {
      this.patients = patients;
    });

    this.patientBalanceService.patientBalances$.subscribe(balances => {
      this.patientBalances = balances;
    });

    this.patientBalanceService.getPatientPaymentSummaries().subscribe(summaries => {
      this.patientPaymentSummaries = summaries;
    });
  }

  updateStats() {
    const today = new Date();
    this.monthlyRevenue = this.billingService.getMonthlyRevenue(today.getFullYear(), today.getMonth());
    this.outstandingAmount = this.billingService.getOutstandingAmount();
    this.pendingBills = this.billingService.getPendingBills();
    this.overdueBills = this.billingService.getOverdueBills();
  }

  createBillForm(): FormGroup {
    return this.fb.group({
      patientId: ['', Validators.required],
      discount: [0, [Validators.min(0)]],
      notes: [''],
      items: this.fb.array([])
    });
  }

  createPaymentForm(): FormGroup {
    return this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      method: ['', Validators.required]
    });
  }

  createTemplateForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      defaultPrice: ['', [Validators.required, Validators.min(0.01)]],
      description: ['']
    });
  }

  get billItems() {
    return this.billForm.get('items') as FormArray;
  }

  addBillItem() {
    const itemForm = this.fb.group({
      description: ['', Validators.required],
      category: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: ['', [Validators.required, Validators.min(0)]]
    });

    this.billItems.push(itemForm);
  }

  removeBillItem(index: number) {
    this.billItems.removeAt(index);
  }

  onServiceSelect(index: number) {
    const serviceName = this.billItems.at(index).get('description')?.value;
    const template = this.serviceTemplates.find(t => t.name === serviceName);
    
    if (template) {
      this.billItems.at(index).patchValue({
        category: template.category,
        unitPrice: template.defaultPrice
      });
      this.calculateItemTotal(index);
    }
  }

  calculateItemTotal(index: number) {
    const item = this.billItems.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    return quantity * unitPrice;
  }

  getItemTotal(index: number): number {
    return this.calculateItemTotal(index);
  }

  calculateSubtotal(): number {
    return this.billItems.controls.reduce((total, item) => {
      const quantity = item.get('quantity')?.value || 0;
      const unitPrice = item.get('unitPrice')?.value || 0;
      return total + (quantity * unitPrice);
    }, 0);
  }

  calculateTax(): number {
    return this.calculateSubtotal() * 0.08; // 8% tax
  }

  calculateTotal(): number {
    const subtotal = this.calculateSubtotal();
    const tax = this.calculateTax();
    const discount = this.billForm.get('discount')?.value || 0;
    return subtotal + tax - discount;
  }

  filterBills() {
    let filtered = [...this.bills];

    if (this.searchQuery.trim()) {
      filtered = filtered.filter(bill =>
        bill.patientName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        bill.billNumber.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(bill => bill.status === this.statusFilter);
    }

    filtered.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

    this.filteredBills = filtered;
  }

  viewBill(bill: Bill) {
    this.selectedBill = bill;
    this.showViewBillModal = true;
  }

  editBill(bill: Bill) {
    this.editingBill = bill;
    this.populateBillForm(bill);
    this.showEditBillModal = true;
  }

  populateBillForm(bill: Bill) {
    this.billForm.patchValue({
      patientId: bill.patientId,
      discount: bill.discount,
      notes: bill.notes
    });

    // Clear existing items
    while (this.billItems.length !== 0) {
      this.billItems.removeAt(0);
    }

    // Add bill items
    bill.items.forEach(item => {
      const itemForm = this.fb.group({
        description: [item.description, Validators.required],
        category: [item.category, Validators.required],
        quantity: [item.quantity, [Validators.required, Validators.min(1)]],
        unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]]
      });
      this.billItems.push(itemForm);
    });
  }

  sendBill(billId: string) {
    this.billingService.sendBill(billId);
  }

  markAsPaid(bill: Bill) {
    this.selectedBill = bill;
    this.paymentForm.patchValue({
      amount: bill.total
    });
    this.showPaymentModal = true;
  }

  downloadBill(bill: Bill) {
    // In a real application, this would generate and download a PDF
    console.log('Downloading bill:', bill.billNumber);
    alert('PDF download would be implemented here');
  }

  getBillByPayment(billId: string): Bill | undefined {
    return this.bills.find(bill => bill.id === billId);
  }

  onSubmitBill() {
    if (this.billForm.valid && this.billItems.length > 0) {
      const formData = this.billForm.value;
      
      const billData: CreateBillRequest = {
        patientId: formData.patientId,
        items: formData.items,
        discount: formData.discount || 0,
        notes: formData.notes || ''
      };

      if (this.editingBill) {
        // Convert CreateBillRequest to partial Bill format for update
        const updateData: Partial<Bill> = {
          patientId: billData.patientId,
          items: billData.items.map(item => ({
            ...item,
            id: 'item_' + Math.random().toString(36).substr(2, 9),
            total: item.quantity * item.unitPrice
          })),
          discount: billData.discount,
          notes: billData.notes
        };
        this.billingService.updateBill(this.editingBill.id, updateData);
      } else {
        this.billingService.createBill(billData);
      }

      this.closeModal();
    }
  }

  onSubmitPayment() {
    if (this.paymentForm.valid && this.selectedBill) {
      const formData = this.paymentForm.value;
      this.billingService.markAsPaid(this.selectedBill.id, formData.method, formData.amount);
      this.closeModal();
    }
  }

  onSubmitTemplate() {
    if (this.templateForm.valid) {
      const formData = this.templateForm.value;
      this.billingService.addServiceTemplate(formData);
      this.closeModal();
    }
  }

  getOutstandingTotal = (total: number, balance: PatientBalance): number => {
    return total + balance.remainingBalance;
  }

  viewPatientBills(patientId: string) {
    this.activeTab = 'bills';
    // Filter bills for this patient
    this.searchQuery = '';
    this.statusFilter = '';
    setTimeout(() => {
      const patient = this.patients.find(p => p.id === patientId);
      if (patient) {
        this.searchQuery = `${patient.firstName} ${patient.lastName}`;
        this.filterBills();
      }
    }, 100);
  }

  createPaymentPlan(balance: PatientBalance) {
    // This would open a payment plan modal
    alert(`Payment plan feature for ${balance.patientName} would be implemented here. Outstanding: $${balance.remainingBalance.toFixed(2)}`);
  }

  closeModal() {
    this.showCreateBillModal = false;
    this.showEditBillModal = false;
    this.showViewBillModal = false;
    this.showPaymentModal = false;
    this.showTemplateModal = false;
    this.selectedBill = null;
    this.editingBill = null;

    this.billForm.reset();
    this.paymentForm.reset();
    this.templateForm.reset();

    this.billForm = this.createBillForm();
    this.paymentForm = this.createPaymentForm();
    this.templateForm = this.createTemplateForm();
  }
}
