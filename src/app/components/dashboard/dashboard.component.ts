import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PatientBalanceService } from '../../services/patient-balance.service';
import { PatientBalance, PatientPaymentSummary } from '../../models/patient-balance.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Welcome back, Dr. Smith! Here's your clinic overview.</p>
      </header>
      
      <div class="stats-grid">
        <div class="stat-card patients">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3 class="stat-value">{{ totalPatients }}</h3>
            <p class="stat-label">Total Patients</p>
          </div>
        </div>
        
        <div class="stat-card appointments">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <h3 class="stat-value">{{ todayAppointments }}</h3>
            <p class="stat-label">Today's Appointments</p>
          </div>
        </div>
        
        <div class="stat-card revenue">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3 class="stat-value">₹{{ monthlyRevenue | number }}</h3>
            <p class="stat-label">Monthly Revenue</p>
          </div>
        </div>
        
        <div class="stat-card pending">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <h3 class="stat-value">{{ pendingBills }}</h3>
            <p class="stat-label">Pending Bills</p>
          </div>
        </div>
      </div>
      
      <div class="dashboard-content">
        <div class="content-left">
          <div class="widget">
            <div class="widget-header">
              <h3 class="widget-title">Today's Appointments</h3>
              <a routerLink="/appointments" class="view-all-link">View All</a>
            </div>
            <div class="appointment-list">
              <div *ngFor="let appointment of upcomingAppointments" class="appointment-item">
                <div class="appointment-time">{{ appointment.time }}</div>
                <div class="appointment-details">
                  <h4 class="patient-name">{{ appointment.patientName }}</h4>
                  <p class="appointment-type">{{ appointment.type }}</p>
                </div>
                <div class="appointment-status" [class]="appointment.status">
                  {{ appointment.status }}
                </div>
              </div>
              
              <div *ngIf="upcomingAppointments.length === 0" class="empty-state">
                <p>No appointments scheduled for today</p>
              </div>
            </div>
          </div>
          
          <div class="widget">
            <div class="widget-header">
              <h3 class="widget-title">Recent Patients</h3>
              <a routerLink="/patients" class="view-all-link">View All</a>
            </div>
            <div class="patient-list">
              <div *ngFor="let patient of recentPatients" class="patient-item">
                <div class="patient-avatar">{{ patient.name.charAt(0) }}</div>
                <div class="patient-info">
                  <h4 class="patient-name">{{ patient.name }}</h4>
                  <p class="patient-details">{{ patient.phone }} • Last visit: {{ patient.lastVisit }}</p>
                </div>
                <div class="patient-actions">
                  <button class="action-btn">View</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="content-right">
          <div class="widget">
            <div class="widget-header">
              <h3 class="widget-title">Outstanding Balances</h3>
              <a routerLink="/billing" class="view-all-link">View All</a>
            </div>
            <div class="balance-list">
              <div *ngFor="let balance of topDebtors" class="balance-item">
                <div class="balance-patient">
                  <h4 class="patient-name">{{ balance.patientName }}</h4>
                  <p class="balance-details">Total Billed: ₹{{ balance.totalBilled | number:'1.2-2' }}</p>
                  <p class="balance-details">Paid: ₹{{ balance.totalPaid | number:'1.2-2' }}</p>
                </div>
                <div class="balance-amount outstanding">
                  ₹{{ balance.remainingBalance | number:'1.2-2' }}
                </div>
              </div>

              <div *ngIf="topDebtors.length === 0" class="empty-state">
                <p>All patients have paid their bills! 🎉</p>
              </div>
            </div>
          </div>

          <div class="widget">
            <div class="widget-header">
              <h3 class="widget-title">Alerts & Notifications</h3>
            </div>
            <div class="alerts-list">
              <div *ngFor="let alert of alerts" class="alert-item" [class]="alert.type">
                <div class="alert-icon">{{ alert.icon }}</div>
                <div class="alert-content">
                  <h4 class="alert-title">{{ alert.title }}</h4>
                  <p class="alert-message">{{ alert.message }}</p>
                  <span class="alert-time">{{ alert.time }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="widget">
            <div class="widget-header">
              <h3 class="widget-title">Quick Actions</h3>
            </div>
            <div class="quick-actions">
              <button routerLink="/patients" class="action-button primary">
                <span class="action-icon">👤</span>
                Add New Patient
              </button>
              <button routerLink="/appointments" class="action-button secondary">
                <span class="action-icon">📅</span>
                Schedule Appointment
              </button>
              <button routerLink="/billing" class="action-button tertiary">
                <span class="action-icon">💳</span>
                Generate Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .dashboard-header {
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
    
    .stats-grid {
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
    
    .stat-card.patients .stat-icon { background: #e0f2fe; }
    .stat-card.appointments .stat-icon { background: #cffafe; }
    .stat-card.revenue .stat-icon { background: #bae6fd; }
    .stat-card.pending .stat-icon { background: #7dd3fc; }
    
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
    
    .dashboard-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }
    
    .widget {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
    }
    
    .widget-header {
      padding: 1.5rem 1.5rem 0 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .widget-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .view-all-link {
      color: #3b82f6;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .view-all-link:hover {
      color: #2563eb;
    }
    
    .appointment-list,
    .patient-list,
    .alerts-list {
      padding: 0 1.5rem 1.5rem 1.5rem;
    }
    
    .appointment-item,
    .patient-item {
      display: flex;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .appointment-item:last-child,
    .patient-item:last-child {
      border-bottom: none;
    }
    
    .appointment-time {
      font-weight: 600;
      color: #1f2937;
      width: 80px;
      font-size: 0.9rem;
    }
    
    .appointment-details {
      flex: 1;
      margin-left: 1rem;
    }
    
    .patient-name,
    .appointment-details h4 {
      margin: 0;
      font-weight: 600;
      color: #1f2937;
    }
    
    .appointment-type,
    .patient-details {
      margin: 0.25rem 0 0 0;
      color: #6b7280;
      font-size: 0.9rem;
    }
    
    .appointment-status {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: capitalize;
    }
    
    .appointment-status.confirmed {
      background: #dcfce7;
      color: #16a34a;
    }
    
    .appointment-status.pending {
      background: #fef3c7;
      color: #d97706;
    }
    
    .patient-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #374151;
    }
    
    .patient-info {
      flex: 1;
      margin-left: 1rem;
    }
    
    .action-btn {
      background: #f3f4f6;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      color: #374151;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    
    .action-btn:hover {
      background: #e5e7eb;
    }
    
    .alert-item {
      display: flex;
      padding: 1rem 0;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .alert-item:last-child {
      border-bottom: none;
    }
    
    .alert-icon {
      font-size: 1.5rem;
      margin-right: 1rem;
    }
    
    .alert-title {
      margin: 0;
      font-weight: 600;
      color: #1f2937;
      font-size: 0.9rem;
    }
    
    .alert-message {
      margin: 0.25rem 0;
      color: #6b7280;
      font-size: 0.8rem;
    }
    
    .alert-time {
      color: #9ca3af;
      font-size: 0.75rem;
    }
    
    .quick-actions {
      padding: 1.5rem;
    }
    
    .action-button {
      width: 100%;
      display: flex;
      align-items: center;
      padding: 1rem;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      margin-bottom: 0.75rem;
      transition: all 0.2s ease;
      text-decoration: none;
    }
    
    .action-button:last-child {
      margin-bottom: 0;
    }
    
    .action-icon {
      margin-right: 0.75rem;
      font-size: 1.1rem;
    }
    
    .action-button.primary {
      background: #0ea5e9;
      color: white;
    }

    .action-button.primary:hover {
      background: #0284c7;
    }

    .action-button.secondary {
      background: #0891b2;
      color: white;
    }

    .action-button.secondary:hover {
      background: #0e7490;
    }

    .action-button.tertiary {
      background: #06b6d4;
      color: white;
    }

    .action-button.tertiary:hover {
      background: #0891b2;
    }
    
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
    }
    
    .balance-list {
      padding: 0 1.5rem 1.5rem 1.5rem;
    }

    .balance-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .balance-item:last-child {
      border-bottom: none;
    }

    .balance-patient h4 {
      margin: 0 0 0.25rem 0;
      font-weight: 600;
      color: #1f2937;
    }

    .balance-details {
      margin: 0.125rem 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .balance-amount {
      font-size: 1.1rem;
      font-weight: 600;
    }

    .balance-amount.outstanding {
      color: #dc2626;
    }

    @media (max-width: 1024px) {
      .dashboard-content {
        grid-template-columns: 1fr;
      }
    }
    
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  totalPatients = 142;
  todayAppointments = 8;
  monthlyRevenue = 12500;
  pendingBills = 5;

  topDebtors: PatientBalance[] = [];
  totalOutstanding = 0;
  
  upcomingAppointments = [
    {
      time: '09:00',
      patientName: 'John Doe',
      type: 'Routine Cleaning',
      status: 'confirmed'
    },
    {
      time: '10:30',
      patientName: 'Sarah Wilson',
      type: 'Tooth Extraction',
      status: 'confirmed'
    },
    {
      time: '14:00',
      patientName: 'Mike Johnson',
      type: 'Root Canal',
      status: 'pending'
    }
  ];
  
  recentPatients = [
    {
      name: 'Emma Davis',
      phone: '+1 (555) 123-4567',
      lastVisit: 'Jan 15, 2024'
    },
    {
      name: 'Robert Brown',
      phone: '+1 (555) 987-6543',
      lastVisit: 'Jan 12, 2024'
    },
    {
      name: 'Lisa Anderson',
      phone: '+1 (555) 456-7890',
      lastVisit: 'Jan 10, 2024'
    }
  ];
  
  alerts = [
    {
      type: 'warning',
      icon: '⚠️',
      title: 'Appointment Reminder',
      message: 'Sarah Wilson has an appointment in 30 minutes',
      time: '10 min ago'
    },
    {
      type: 'info',
      icon: '📋',
      title: 'Inventory Low',
      message: 'Dental floss stock is running low',
      time: '1 hour ago'
    },
    {
      type: 'success',
      icon: '✅',
      title: 'Payment Received',
      message: 'John Doe paid $250 for cleaning',
      time: '2 hours ago'
    }
  ];

  constructor(private patientBalanceService: PatientBalanceService) {}

  ngOnInit() {
    // Load patient balance data
    this.patientBalanceService.getTopDebtors(5).subscribe(debtors => {
      this.topDebtors = debtors;
    });

    this.patientBalanceService.getTotalOutstandingAmount().subscribe(total => {
      this.totalOutstanding = total;
    });
  }
}
