import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { BillingService } from '../../services/billing.service';
import { PatientService } from '../../services/patient.service';
import { PatientBalanceService } from '../../services/patient-balance.service';
import { Bill, CreateBillRequest, BillStatus, PaymentMethod, ServiceTemplate, ServiceCategory, BillItem, Payment } from '../../models/billing.model';
import { Patient } from '../../models/patient.model';
import { PatientBalance, PatientPaymentSummary } from '../../models/patient-balance.model';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']

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
    private fb: FormBuilder,
    private translationService: TranslationService
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
    this.billingService.sendBill(billId).subscribe({
      next: (success) => {
        if (success) {
          console.log('Bill sent successfully');
        } else {
          console.error('Failed to send bill');
        }
      },
      error: (error) => {
        console.error('Error sending bill:', error);
      }
    });
  }

  markAsPaid(bill: Bill) {
    this.selectedBill = bill;
    this.paymentForm.patchValue({
      amount: bill.total
    });
    this.showPaymentModal = true;
  }

  downloadBill(bill: Bill) {
    const pdf = new jsPDF();

    // Header Background
    pdf.setFillColor(14, 165, 233); // Blue background
    pdf.rect(0, 0, 210, 45, 'F');

    // Clinic Logo Area
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🦷 Sai Dental Care', 20, 25);

    // Tagline
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text(this.translationService.translate('clinic.tagline'), 20, 35);

    // Reset colors for content
    pdf.setTextColor(0, 0, 0);

    // Clinic Information Box
    pdf.setFillColor(248, 250, 252); // Light gray background
    pdf.rect(15, 55, 90, 45, 'F');
    pdf.setDrawColor(229, 231, 235);
    pdf.rect(15, 55, 90, 45, 'S');

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Dr. Snahe Funde BDS (MUHS)', 20, 65);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Reg. No: A-50911', 20, 72);

    // Contact Information with Icons
    pdf.setFontSize(9);
    pdf.text('📍 Chattrapati Shivaji Maharaj Chowk,', 20, 80);
    pdf.text('   Nere-Dattawadi, Mulashi, Pune - 411057', 20, 85);
    pdf.text('📞 +91 98765 43210', 20, 92);
    pdf.text('✉️ info@saidentalcare.com', 20, 97);

    // Invoice Information Box
    pdf.setFillColor(254, 243, 199); // Light yellow background
    pdf.rect(110, 55, 85, 45, 'F');
    pdf.setDrawColor(245, 158, 11);
    pdf.rect(110, 55, 85, 45, 'S');

    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(180, 83, 9);
    pdf.text('INVOICE', 115, 68);

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(bill.billNumber, 115, 78);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Issue Date: ${bill.issueDate.toLocaleDateString()}`, 115, 85);
    pdf.text(`Due Date: ${bill.dueDate.toLocaleDateString()}`, 115, 92);

    // Status Badge
    const statusText = this.getBillStatusTranslation(bill.status);
    const statusColor = this.getStatusColor(bill.status);
    pdf.setFillColor(statusColor.bg.r, statusColor.bg.g, statusColor.bg.b);
    pdf.setTextColor(statusColor.text.r, statusColor.text.g, statusColor.text.b);
    pdf.rect(115, 95, 30, 8, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(statusText.toUpperCase(), 117, 100);

    // Patient information
    pdf.setFontSize(14);
    pdf.text('Bill To:', 20, 80);
    pdf.setFontSize(12);
    pdf.text(bill.patientName, 20, 90);

    // Bill items table
    let yPosition = 110;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Description', 20, yPosition);
    pdf.text('Category', 80, yPosition);
    pdf.text('Qty', 120, yPosition);
    pdf.text('Unit Price', 140, yPosition);
    pdf.text('Total', 170, yPosition);

    pdf.setFont('helvetica', 'normal');
    yPosition += 10;

    bill.items.forEach(item => {
      pdf.text(item.description, 20, yPosition);
      pdf.text(item.category, 80, yPosition);
      pdf.text(item.quantity.toString(), 120, yPosition);
      pdf.text(`₹${item.unitPrice.toFixed(2)}`, 140, yPosition);
      pdf.text(`₹${item.total.toFixed(2)}`, 170, yPosition);
      yPosition += 10;
    });

    // Totals
    yPosition += 10;
    pdf.text(`Subtotal: ₹${bill.subtotal.toFixed(2)}`, 120, yPosition);
    yPosition += 10;
    pdf.text(`Tax: ₹${bill.tax.toFixed(2)}`, 120, yPosition);

    if (bill.discount > 0) {
      yPosition += 10;
      pdf.text(`Discount: -₹${bill.discount.toFixed(2)}`, 120, yPosition);
    }

    yPosition += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Total: ₹${bill.total.toFixed(2)}`, 120, yPosition);

    // Notes
    if (bill.notes) {
      yPosition += 20;
      pdf.setFont('helvetica', 'normal');
      pdf.text('Notes:', 20, yPosition);
      yPosition += 10;

      // Split long notes into multiple lines
      const splitNotes = pdf.splitTextToSize(bill.notes, 170);
      pdf.text(splitNotes, 20, yPosition);
    }

    // Footer
    const pageHeight = pdf.internal.pageSize.height;
    pdf.setFontSize(10);
    pdf.text('Thank you for choosing Sai Dental Care!', 20, pageHeight - 20);

    // Download the PDF
    pdf.save(`${bill.billNumber}.pdf`);
  }

  getBillByPayment(billId: string): Bill | undefined {
    return this.bills.find(bill => bill.id === billId);
  }

  onSubmitBill() {
    if (this.billForm.valid && this.billItems.length > 0) {
      const formData = this.billForm.value;
      const patient: Patient[] = this.patients.filter(index => formData.patientId == index.id)
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
          patientName: patient[0].firstName + " " + patient[0].lastName,
          items: billData.items.map(item => ({
            ...item,
            id: 'item_' + Math.random().toString(36).substr(2, 9),
            total: item.quantity * item.unitPrice
          })),
          discount: billData.discount,
          notes: billData.notes,
          total: this.editingBill.total + this.editingBill.discount - billData.discount
        };
        this.billingService.updateBill(this.editingBill.id, updateData).subscribe({
          next: (updatedBill) => {
            console.log('Bill updated successfully');
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating bill:', error);
          }
        });
      } else {
        this.billingService.createBill(billData).subscribe({
          next: (newBill) => {
            console.log('Bill created successfully');
            this.closeModal();
          },
          error: (error) => {
            console.error('Error creating bill:', error);
          }
        });
      }
    }
  }

  onSubmitPayment() {
    if (this.paymentForm.valid && this.selectedBill) {
      const formData = this.paymentForm.value;
      this.billingService.markAsPaid(this.selectedBill.id, formData.method, formData.amount).subscribe({
        next: (success) => {
          if (success) {
            console.log('Payment recorded successfully');
            this.closeModal();
          } else {
            console.error('Failed to record payment');
          }
        },
        error: (error) => {
          console.error('Error recording payment:', error);
        }
      });
    }
  }

  onSubmitTemplate() {
    if (this.templateForm.valid) {
      const formData = this.templateForm.value;
      this.billingService.addServiceTemplate(formData).subscribe({
        next: (template) => {
          console.log('Service template added successfully');
          this.closeModal();
        },
        error: (error) => {
          console.error('Error adding service template:', error);
        }
      });
    }
  }

  getOutstandingTotal = (total: number, balance: PatientBalance): number => {
    return total + balance.remainingBalance;
  }

  getPatientsWithBalance(): PatientBalance[] {
    return this.patientBalances.filter(balance => balance.remainingBalance > 0);
  }

  getTotalOutstandingAmount(): number {
    return this.patientBalances.reduce((total, balance) => total + balance.remainingBalance, 0);
  }

  getPatientsWithBalanceCount(): number {
    return this.patientBalances.filter(balance => balance.remainingBalance > 0).length;
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
    alert(`Payment plan feature for ${balance.patientName} would be implemented here. Outstanding: ₹${balance.remainingBalance.toFixed(2)}`);
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

  getBillStatusTranslation(status: string): string {
    const statusMap: { [key: string]: string } = {
      'draft': 'billing.status.draft',
      'sent': 'billing.status.sent',
      'paid': 'billing.status.paid',
      'overdue': 'billing.status.overdue',
      'cancelled': 'billing.status.cancelled',
      'partial': 'billing.status.partial'
    };

    const translationKey = statusMap[status] || status;
    return this.translationService.translate(translationKey);
  }

  getStatusColor(status: string): { bg: { r: number, g: number, b: number }, text: { r: number, g: number, b: number } } {
    const colors: { [key: string]: any } = {
      'draft': { bg: { r: 243, g: 244, b: 246 }, text: { r: 55, g: 65, b: 81 } },
      'sent': { bg: { r: 219, g: 234, b: 254 }, text: { r: 37, g: 99, b: 235 } },
      'paid': { bg: { r: 220, g: 252, b: 231 }, text: { r: 22, g: 163, b: 74 } },
      'overdue': { bg: { r: 254, g: 226, b: 226 }, text: { r: 220, g: 38, b: 38 } },
      'cancelled': { bg: { r: 243, g: 244, b: 246 }, text: { r: 107, g: 114, b: 128 } },
      'partial': { bg: { r: 254, g: 243, b: 199 }, text: { r: 217, g: 119, b: 6 } }
    };
    return colors[status] || colors['draft'];
  }
}
