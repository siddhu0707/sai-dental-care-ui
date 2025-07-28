import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PatientBalanceService } from '../../services/patient-balance.service';
import { PatientService } from '../../services/patient.service';
import { AppointmentService } from '../../services/appointment.service';
import { BillingService } from '../../services/billing.service';
import { PatientBalance, PatientPaymentSummary } from '../../models/patient-balance.model';
import { Patient } from '../../models/patient.model';
import { Appointment } from '../../models/appointment.model';
import { Bill } from '../../models/billing.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1 class="page-title">{{ 'dashboard.title' | translate }}</h1>
        <p class="page-subtitle">{{ 'dashboard.subtitle' | translate }}</p>
      </header>
      
      <div class="stats-grid">
        <div class="stat-card patients">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3 class="stat-value">{{ totalPatients }}</h3>
            <p class="stat-label">{{ 'dashboard.totalPatients' | translate }}</p>
          </div>
        </div>

        <div class="stat-card appointments">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <h3 class="stat-value">{{ todayAppointments }}</h3>
            <p class="stat-label">{{ 'dashboard.todayAppointments' | translate }}</p>
          </div>
        </div>

        <div class="stat-card revenue">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3 class="stat-value">₹{{ monthlyRevenue | number }}</h3>
            <p class="stat-label">{{ 'dashboard.monthlyRevenue' | translate }}</p>
          </div>
        </div>

        <div class="stat-card pending">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <h3 class="stat-value">{{ pendingBills }}</h3>
            <p class="stat-label">{{ 'dashboard.pendingBills' | translate }}</p>
          </div>
        </div>
      </div>
      
      <div class="dashboard-content">
        <div class="content-left">
          <div class="widget">
            <div class="widget-header">
              <h3 class="widget-title">{{ 'dashboard.todayAppointments' | translate }}</h3>
              <a routerLink="/appointments" class="view-all-link">{{ 'common.view' | translate }} {{ 'common.all' | translate }}</a>
            </div>
            <div class="appointment-list">
              <div *ngFor="let appointment of upcomingAppointments" class="appointment-item">
                <div class="appointment-time">{{ appointment.time }}</div>
                <div class="appointment-details">
                  <h4 class="patient-name">{{ appointment.patientName }}</h4>
                  <p class="appointment-type">{{ appointment.type }}</p>
                </div>
                <div class="appointment-status" [class]="appointment.status">
            {{ appointment.status | titlecase }}
          </div>
              </div>
              
              <div *ngIf="upcomingAppointments.length === 0" class="empty-state">
                <p>{{ 'common.noAppointments' | translate }}</p>
              </div>
            </div>
          </div>

          <div class="widget">
            <div class="widget-header">
              <h3 class="widget-title">{{ 'common.recent' | translate }} {{ 'nav.patients' | translate }}</h3>
              <a routerLink="/patients" class="view-all-link">{{ 'common.view' | translate }} {{ 'common.all' | translate }}</a>
            </div>
            <div class="patient-list">
              <div *ngFor="let patient of recentPatients" class="patient-item">
                <div class="patient-avatar">{{ patient.name.charAt(0) }}</div>
                <div class="patient-info">
                  <h4 class="patient-name">{{ patient.name }}</h4>
                  <p class="patient-details">{{ patient.phone }} • Last visit: {{ patient.lastVisit }}</p>
                </div>
                <div class="patient-actions">
                  <button class="action-btn">{{ 'common.view' | translate }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="content-right">
          <div class="widget">
            <div class="widget-header">
              <h3 class="widget-title">{{ 'billing.outstandingAmount' | translate }}</h3>
              <a routerLink="/billing" class="view-all-link">{{ 'common.view' | translate }} {{ 'common.all' | translate }}</a>
            </div>
            <div class="balance-list">
              <div *ngFor="let balance of topDebtors" class="balance-item">
                <div class="balance-patient">
                  <h4 class="patient-name">{{ balance.patientName }}</h4>
                  <p class="balance-details">{{ 'common.total' | translate }} {{ 'common.billed' | translate }}: ₹{{ balance.totalBilled | number:'1.2-2' }}</p>
                  <p class="balance-details">{{ 'common.paid' | translate }}: ₹{{ balance.totalPaid | number:'1.2-2' }}</p>
                </div>
                <div class="balance-amount outstanding">
                  ₹{{ balance.remainingBalance | number:'1.2-2' }}
                </div>
              </div>

              <div *ngIf="topDebtors.length === 0" class="empty-state">
                <p>{{ 'dashboard.allPaid' | translate }} 🎉</p>
              </div>
            </div>
          </div>

          <div class="widget">
            <div class="widget-header">
              <h3 class="widget-title">{{ 'dashboard.alerts' | translate }}</h3>
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
              <h3 class="widget-title">{{ 'common.quickActions' | translate }}</h3>
            </div>
            <div class="quick-actions">
              <button routerLink="/patients" class="action-button primary">
                <span class="action-icon">👤</span>
                {{ 'dashboard.addPatient' | translate }}
              </button>
              <button routerLink="/appointments" class="action-button secondary">
                <span class="action-icon">📅</span>
                {{ 'dashboard.scheduleAppointment' | translate }}
              </button>
              <button routerLink="/billing" class="action-button tertiary">
                <span class="action-icon">💳</span>
                {{ 'dashboard.createBill' | translate }}
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
  totalPatients = 0;
  todayAppointments = 0;
  monthlyRevenue = 0;
  pendingBills = 0;

  topDebtors: PatientBalance[] = [];
  totalOutstanding = 0;

  upcomingAppointments: any[] = [];
  recentPatients: any[] = [];

  alerts = [
    {
      type: 'warning',
      icon: '⚠️',
      title: 'Appointment Reminder',
      message: 'Check today\'s appointments',
      time: '10 min ago'
    },
    {
      type: 'info',
      icon: '📋',
      title: 'System Status',
      message: 'All systems operational',
      time: '1 hour ago'
    },
    {
      type: 'success',
      icon: '✅',
      title: 'Data Updated',
      message: 'Dashboard data refreshed successfully',
      time: '2 hours ago'
    }
  ];

  constructor(
    private patientBalanceService: PatientBalanceService,
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private billingService: BillingService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // Load all data in parallel
    combineLatest([
      this.patientService.getPatients(),
      this.appointmentService.getAppointments(),
      this.billingService.getBills()
    ]).subscribe(([patients, appointments, bills]) => {
      this.updateStats(patients, appointments, bills);
      this.updateUpcomingAppointments(appointments);
      this.updateRecentPatients(patients);
      this.generateAlertsFromData(appointments, bills);
    });

    // Load patient balance data
    this.patientBalanceService.getTopDebtors(5).subscribe(debtors => {
      this.topDebtors = debtors;
    });

    this.patientBalanceService.getTotalOutstandingAmount().subscribe(total => {
      this.totalOutstanding = total;
    });
  }

  private updateStats(patients: Patient[], appointments: Appointment[], bills: Bill[]) {
    // Total patients
    this.totalPatients = patients.length;

    // Today's appointments
    const today = new Date();
    this.todayAppointments = appointments.filter(appointment =>
      this.isSameDay(appointment.appointmentDate, today)
    ).length;

    // Monthly revenue (current month)
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    this.monthlyRevenue = bills
      .filter(bill => {
        const billDate = bill.paymentDate || bill.issueDate;
        return bill.status === 'paid' &&
               billDate.getMonth() === currentMonth &&
               billDate.getFullYear() === currentYear;
      })
      .reduce((total, bill) => total + bill.total, 0);

    // Pending bills
    this.pendingBills = bills.filter(bill =>
      bill.status === 'sent' || bill.status === 'overdue'
    ).length;
  }

  private updateUpcomingAppointments(appointments: Appointment[]) {
    const today = new Date();
    const todayAppointments = appointments
      .filter(appointment => this.isSameDay(appointment.appointmentDate, today))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 5);

    this.upcomingAppointments = todayAppointments.map(appointment => ({
      time: appointment.startTime,
      patientName: appointment.patientName,
      type: appointment.type,
      status: appointment.status
    }));
  }

  private updateRecentPatients(patients: Patient[]) {
    this.recentPatients = patients
      .filter(patient => patient.lastVisit)
      .sort((a, b) => {
        if (!a.lastVisit || !b.lastVisit) return 0;
        return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
      })
      .slice(0, 3)
      .map(patient => ({
        name: `${patient.firstName} ${patient.lastName}`,
        phone: patient.phone,
        lastVisit: patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }) : 'Never'
      }));
  }

  private generateAlertsFromData(appointments: Appointment[], bills: Bill[]) {
    const today = new Date();
    const upcomingAppointments = appointments.filter(appointment =>
      this.isSameDay(appointment.appointmentDate, today)
    );

    const overdueBills = bills.filter(bill =>
      (bill.status === 'sent' || bill.status === 'overdue') &&
      bill.dueDate < today
    );

    const recentPayments = bills.filter(bill =>
      bill.status === 'paid' &&
      bill.paymentDate &&
      (today.getTime() - bill.paymentDate.getTime()) < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    this.alerts = [];

    if (upcomingAppointments.length > 0) {
      this.alerts.push({
        type: 'info',
        icon: '📅',
        title: 'Today\'s Schedule',
        message: `${upcomingAppointments.length} appointments scheduled for today`,
        time: 'Now'
      });
    }

    if (overdueBills.length > 0) {
      this.alerts.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Overdue Bills',
        message: `${overdueBills.length} bills are overdue`,
        time: '1 hour ago'
      });
    }

    if (recentPayments.length > 0) {
      this.alerts.push({
        type: 'success',
        icon: '✅',
        title: 'Recent Payments',
        message: `${recentPayments.length} payment(s) received today`,
        time: '2 hours ago'
      });
    }

    // Default alert if no specific alerts
    if (this.alerts.length === 0) {
      this.alerts.push({
        type: 'info',
        icon: '📊',
        title: 'Dashboard Updated',
        message: 'All data is up to date',
        time: 'Just now'
      });
    }
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
}
