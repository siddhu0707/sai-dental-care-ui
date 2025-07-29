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
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
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
