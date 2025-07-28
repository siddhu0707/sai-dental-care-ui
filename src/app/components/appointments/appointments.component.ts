import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { PatientService } from '../../services/patient.service';
import { Appointment, CreateAppointmentRequest, AppointmentType, AppointmentStatus, TimeSlot } from '../../models/appointment.model';
import { Patient } from '../../models/patient.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="appointments-container">
      <header class="appointments-header">
        <div class="header-left">
          <h1 class="page-title">{{ 'appointments.title' | translate }}</h1>
          <p class="page-subtitle">{{ 'appointments.subtitle' | translate }}</p>
        </div>
        <div class="header-right">
          <button (click)="showScheduleModal = true" class="schedule-btn">
            <span class="btn-icon">📅</span>
            {{ 'appointments.schedule' | translate }}
          </button>
        </div>
      </header>
      
      <div class="appointments-tabs">
        <button
          (click)="activeTab = 'today'"
          [class.active]="activeTab === 'today'"
          class="tab-button"
        >
          {{ 'appointments.todaySchedule' | translate }}
        </button>
        <button
          (click)="activeTab = 'all'"
          [class.active]="activeTab === 'all'"
          class="tab-button"
        >
          {{ 'appointments.allAppointments' | translate }}
        </button>
        <button
          (click)="activeTab = 'calendar'"
          [class.active]="activeTab === 'calendar'"
          class="tab-button"
        >
          {{ 'appointments.calendarView' | translate }}
        </button>
      </div>
      
      <div class="appointments-content">
        <!-- Today's Schedule Tab -->
        <div *ngIf="activeTab === 'today'" class="tab-content">
          <div class="schedule-grid">
            <div class="time-column">
              <div class="time-header">{{ 'common.time' | translate }}</div>
              <div *ngFor="let slot of todaySlots" class="time-slot">
                {{ slot.time }}
              </div>
            </div>
            <div class="appointments-column">
              <div class="appointments-header-cell">{{ 'appointments.todaySchedule' | translate }}</div>
              <div *ngFor="let slot of todaySlots" class="appointment-slot" [class.booked]="!slot.available">
                <div *ngIf="!slot.available && slot.appointmentId" class="appointment-card">
                  <ng-container *ngFor="let appointment of todayAppointments">
                    <div *ngIf="appointment.id === slot.appointmentId" class="appointment-details">
                      <h4 class="patient-name">{{ appointment.patientName }}</h4>
                      <p class="appointment-type">{{ appointment.type }}</p>
                      <p class="appointment-duration">{{ appointment.duration }} minutes</p>
                      <div class="appointment-status" [class]="appointment.status">
                        {{ appointment.status | titlecase }}
                      </div>
                      <div class="appointment-actions">
                        <button (click)="viewAppointment(appointment)" class="action-btn small">{{ 'common.view' | translate }}</button>
                        <button (click)="editAppointment(appointment)" class="action-btn small">{{ 'common.edit' | translate }}</button>
                        <button *ngIf="appointment.status === 'scheduled'"
                                (click)="confirmAppointment(appointment.id)"
                                class="action-btn small confirm">{{ 'common.confirm' | translate }}</button>
                        <button *ngIf="appointment.status === 'confirmed'"
                                (click)="markCompleted(appointment.id)"
                                class="action-btn small complete">{{ 'appointments.complete' | translate }}</button>
                      </div>
                    </div>
                  </ng-container>
                </div>
                <div *ngIf="slot.available" class="empty-slot">
                  <span>{{ 'appointments.available' | translate }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- All Appointments Tab -->
        <div *ngIf="activeTab === 'all'" class="tab-content">
          <div class="appointments-controls">
            <div class="search-container">
              <input
                type="text"
                [placeholder]="'appointments.searchByPatient' | translate"
                [(ngModel)]="searchQuery"
                (input)="filterAppointments()"
                class="search-input"
              >
              <span class="search-icon">🔍</span>
            </div>

            <div class="filter-container">
              <select [(ngModel)]="statusFilter" (change)="filterAppointments()" class="filter-select">
                <option value="">{{ 'appointments.allStatuses' | translate }}</option>
                <option value="scheduled">{{ 'appointments.status.scheduled' | translate }}</option>
                <option value="confirmed">{{ 'appointments.status.confirmed' | translate }}</option>
                <option value="completed">{{ 'appointments.status.completed' | translate }}</option>
                <option value="cancelled">{{ 'appointments.status.cancelled' | translate }}</option>
              </select>

              <input
                type="date"
                [(ngModel)]="dateFilter"
                (change)="filterAppointments()"
                class="date-filter"
              >
            </div>
          </div>
          
          <div class="appointments-list">
            <div *ngFor="let appointment of filteredAppointments" class="appointment-item">
              <div class="appointment-date">
                <div class="date-day">{{ appointment.appointmentDate | date:'dd' }}</div>
                <div class="date-month">{{ appointment.appointmentDate | date:'MMM' }}</div>
                <div class="date-year">{{ appointment.appointmentDate | date:'yyyy' }}</div>
              </div>
              
              <div class="appointment-time">
                <div class="time-start">{{ appointment.startTime }}</div>
                <div class="time-duration">{{ appointment.duration }}min</div>
              </div>
              
              <div class="appointment-info">
                <h3 class="patient-name">{{ appointment.patientName }}</h3>
                <p class="appointment-type">{{ appointment.type }}</p>
                <p class="doctor-name">👨‍⚕️ {{ appointment.doctorName }}</p>
                <p *ngIf="appointment.notes" class="appointment-notes">{{ appointment.notes }}</p>
              </div>
              
              <div class="appointment-status-container">
                <div class="appointment-status" [class]="appointment.status">
                  {{ appointment.status | titlecase }}
                </div>
                <div *ngIf="appointment.reminder?.sent" class="reminder-status">
                  ✅ Reminder sent
                </div>
              </div>
              
              <div class="appointment-actions">
                <button (click)="viewAppointment(appointment)" class="action-btn view">View</button>
                <button (click)="editAppointment(appointment)" class="action-btn edit">Edit</button>
                <button *ngIf="appointment.status === 'scheduled'" 
                        (click)="confirmAppointment(appointment.id)" 
                        class="action-btn confirm">Confirm</button>
                <button *ngIf="appointment.status === 'confirmed'" 
                        (click)="markCompleted(appointment.id)" 
                        class="action-btn complete">Complete</button>
                <button (click)="cancelAppointment(appointment.id)" class="action-btn cancel">Cancel</button>
                <button *ngIf="!appointment.reminder?.sent" 
                        (click)="sendReminder(appointment.id)" 
                        class="action-btn remind">Send Reminder</button>
              </div>
            </div>
            
            <div *ngIf="filteredAppointments.length === 0" class="empty-state">
              <div class="empty-icon">📅</div>
              <h3>No appointments found</h3>
              <p>{{ searchQuery || statusFilter || dateFilter ? 'Try adjusting your filters' : 'Schedule your first appointment' }}</p>
            </div>
          </div>
        </div>
        
        <!-- Calendar Tab -->
        <div *ngIf="activeTab === 'calendar'" class="tab-content">
          <div class="calendar-container">
            <div class="calendar-header">
              <button (click)="previousWeek()" class="nav-btn">‹ Previous</button>
              <h3 class="calendar-title">{{ currentWeekStart | date:'MMM d' }} - {{ currentWeekEnd | date:'MMM d, y' }}</h3>
              <button (click)="nextWeek()" class="nav-btn">Next ›</button>
            </div>
            
            <div class="calendar-grid">
              <div class="calendar-times">
                <div class="time-header">Time</div>
                <div *ngFor="let time of workingHours" class="time-cell">{{ time }}</div>
              </div>
              
              <div *ngFor="let day of currentWeekDays" class="calendar-day">
                <div class="day-header">
                  <div class="day-name">{{ day | date:'EEE' }}</div>
                  <div class="day-date">{{ day | date:'d' }}</div>
                </div>
                
                <div *ngFor="let time of workingHours" class="calendar-cell">
                  <ng-container *ngFor="let appointment of getAppointmentsForTimeSlot(day, time)">
                    <div class="calendar-appointment" [class]="appointment.status">
                      <div class="appointment-title">{{ appointment.patientName }}</div>
                      <div class="appointment-type">{{ appointment.type }}</div>
                    </div>
                  </ng-container>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Schedule Appointment Modal -->
    <div *ngIf="showScheduleModal" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ editingAppointment ? ('appointments.editAppointment' | translate) : ('appointments.scheduleNew' | translate) }}</h2>
          <button (click)="closeModal()" class="close-btn">✕</button>
        </div>

        <form [formGroup]="appointmentForm" (ngSubmit)="onSubmit()" class="appointment-form">
          <div class="form-grid">
            <div class="form-group">
              <label>{{ 'appointments.patient' | translate }} *</label>
              <select formControlName="patientId" class="form-input">
                <option value="">{{ 'appointments.selectPatient' | translate }}</option>
                <option *ngFor="let patient of patients" [value]="patient.id">
                  {{ patient.firstName }} {{ patient.lastName }}
                </option>
              </select>
              <div *ngIf="appointmentForm.get('patientId')?.errors?.['required'] && appointmentForm.get('patientId')?.touched"
                   class="error-message">{{ 'validation.patientRequired' | translate }}</div>
            </div>

            <div class="form-group">
              <label>{{ 'appointments.appointmentType' | translate }} *</label>
              <select formControlName="type" class="form-input">
                <option value="">{{ 'appointments.selectType' | translate }}</option>
                <option *ngFor="let type of appointmentTypes" [value]="type">{{ getAppointmentTypeTranslation(type) }}</option>
              </select>
              <div *ngIf="appointmentForm.get('type')?.errors?.['required'] && appointmentForm.get('type')?.touched"
                   class="error-message">{{ 'validation.appointmentTypeRequired' | translate }}</div>
            </div>

            <div class="form-group">
              <label>{{ 'common.date' | translate }} *</label>
              <input type="date" formControlName="appointmentDate" class="form-input" (change)="onDateChange()" />
              <div *ngIf="appointmentForm.get('appointmentDate')?.errors?.['required'] && appointmentForm.get('appointmentDate')?.touched"
                   class="error-message">{{ 'validation.dateRequired' | translate }}</div>
            </div>

            <div class="form-group">
              <label>{{ 'common.time' | translate }} *</label>
              <select formControlName="startTime" class="form-input">
                <option value="">{{ 'appointments.selectTime' | translate }}</option>
                <option *ngFor="let slot of availableSlots" [value]="slot.time" [disabled]="!slot.available">
                  {{ slot.time }} {{ !slot.available ? ('(' + ('appointments.booked' | translate) + ')') : '' }}
                </option>
              </select>
              <div *ngIf="appointmentForm.get('startTime')?.errors?.['required'] && appointmentForm.get('startTime')?.touched"
                   class="error-message">{{ 'validation.timeRequired' | translate }}</div>
            </div>
            
            <div class="form-group">
              <label>Duration (minutes) *</label>
              <select formControlName="duration" class="form-input">
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Doctor</label>
              <select formControlName="doctorName" class="form-input">
                <option value="Dr. Smith">Dr. Smith</option>
                <option value="Dr. Johnson">Dr. Johnson</option>
                <option value="Dr. Williams">Dr. Williams</option>
              </select>
            </div>
          </div>
          
          <div class="form-group full-width">
            <label>Notes</label>
            <textarea formControlName="notes" class="form-textarea" 
                     placeholder="Additional notes for this appointment"></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" (click)="closeModal()" class="btn secondary">Cancel</button>
            <button type="submit" [disabled]="appointmentForm.invalid" class="btn primary">
              {{ editingAppointment ? 'Update Appointment' : 'Schedule Appointment' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Appointment Detail Modal -->
    <div *ngIf="showViewModal" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Appointment Details</h2>
          <button (click)="closeModal()" class="close-btn">✕</button>
        </div>
        
        <div *ngIf="selectedAppointment" class="appointment-details">
          <div class="detail-grid">
            <div class="detail-item">
              <strong>Patient:</strong> {{ selectedAppointment.patientName }}
            </div>
            <div class="detail-item">
              <strong>Date:</strong> {{ selectedAppointment.appointmentDate | date:'fullDate' }}
            </div>
            <div class="detail-item">
              <strong>Time:</strong> {{ selectedAppointment.startTime }} - {{ selectedAppointment.endTime }}
            </div>
            <div class="detail-item">
              <strong>Type:</strong> {{ selectedAppointment.type }}
            </div>
            <div class="detail-item">
              <strong>Doctor:</strong> {{ selectedAppointment.doctorName }}
            </div>
            <div class="detail-item">
              <strong>Duration:</strong> {{ selectedAppointment.duration }} minutes
            </div>
            <div class="detail-item">
              <strong>Status:</strong> 
              <span class="status-badge" [class]="selectedAppointment.status">
                {{ selectedAppointment.status | titlecase }}
              </span>
            </div>
            <div class="detail-item">
              <strong>Created:</strong> {{ selectedAppointment.createdDate | date:'short' }}
            </div>
          </div>
          
          <div *ngIf="selectedAppointment.notes" class="notes-section">
            <strong>Notes:</strong>
            <p>{{ selectedAppointment.notes }}</p>
          </div>
          
          <div class="reminder-section">
            <strong>Reminder:</strong>
            <p *ngIf="selectedAppointment.reminder?.sent; else noReminder">
              ✅ Sent on {{ selectedAppointment.reminder?.sentDate | date:'short' }}
            </p>
            <ng-template #noReminder>
              <p>❌ Not sent</p>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .appointments-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .appointments-header {
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
    
    .schedule-btn {
      background: #0ea5e9;
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

    .schedule-btn:hover {
      background: #0284c7;
    }
    
    .btn-icon {
      margin-right: 0.5rem;
    }
    
    .appointments-tabs {
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
      color: #0ea5e9;
      border-bottom-color: #0ea5e9;
    }
    
    .schedule-grid {
      display: grid;
      grid-template-columns: 100px 1fr;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      background: white;
    }
    
    .time-column {
      background: #f9fafb;
      border-right: 1px solid #e5e7eb;
    }
    
    .time-header,
    .appointments-header-cell {
      padding: 1rem;
      font-weight: 600;
      background: #f3f4f6;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .time-slot,
    .appointment-slot {
      padding: 0.75rem;
      border-bottom: 1px solid #e5e7eb;
      min-height: 60px;
    }
    
    .appointment-slot.booked {
      background: #fef3c7;
    }
    
    .appointment-card {
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 0.75rem;
      height: 100%;
    }
    
    .patient-name {
      margin: 0 0 0.25rem 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .appointment-type {
      margin: 0 0 0.25rem 0;
      font-size: 0.8rem;
      color: #6b7280;
    }
    
    .appointment-duration {
      margin: 0 0 0.5rem 0;
      font-size: 0.8rem;
      color: #6b7280;
    }
    
    .appointment-status {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: capitalize;
      margin-bottom: 0.5rem;
    }
    
    .appointment-status.scheduled {
      background: #fef3c7;
      color: #d97706;
    }
    
    .appointment-status.confirmed {
      background: #dcfce7;
      color: #16a34a;
    }
    
    .appointment-status.completed {
      background: #e0e7ff;
      color: #4338ca;
    }
    
    .appointment-status.cancelled {
      background: #fee2e2;
      color: #dc2626;
    }
    
    .appointment-actions {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
    }
    
    .action-btn {
      padding: 0.25rem 0.5rem;
      border: none;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .action-btn.small {
      padding: 0.125rem 0.375rem;
      font-size: 0.7rem;
    }
    
    .action-btn.view {
      background: #e5e7eb;
      color: #374151;
    }
    
    .action-btn.edit {
      background: #fef3c7;
      color: #d97706;
    }
    
    .action-btn.confirm {
      background: #dcfce7;
      color: #16a34a;
    }
    
    .action-btn.complete {
      background: #e0e7ff;
      color: #4338ca;
    }
    
    .action-btn.cancel {
      background: #fee2e2;
      color: #dc2626;
    }
    
    .action-btn.remind {
      background: #dbeafe;
      color: #2563eb;
    }
    
    .action-btn:hover {
      opacity: 0.8;
    }
    
    .empty-slot {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #9ca3af;
      font-size: 0.8rem;
    }
    
    .appointments-controls {
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
    
    .filter-container {
      display: flex;
      gap: 1rem;
    }
    
    .filter-select,
    .date-filter {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      background: white;
    }
    
    .appointments-list {
      space-y: 1rem;
    }
    
    .appointment-item {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      display: grid;
      grid-template-columns: 80px 80px 1fr auto auto;
      gap: 1.5rem;
      align-items: center;
      margin-bottom: 1rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .appointment-item:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .appointment-date {
      text-align: center;
      background: #f3f4f6;
      border-radius: 8px;
      padding: 0.75rem 0.5rem;
    }
    
    .date-day {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      line-height: 1;
    }
    
    .date-month {
      font-size: 0.8rem;
      font-weight: 500;
      color: #6b7280;
      text-transform: uppercase;
    }
    
    .date-year {
      font-size: 0.75rem;
      color: #9ca3af;
    }
    
    .appointment-time {
      text-align: center;
    }
    
    .time-start {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .time-duration {
      font-size: 0.8rem;
      color: #6b7280;
    }
    
    .appointment-info h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .appointment-info p {
      margin: 0.125rem 0;
      font-size: 0.9rem;
      color: #6b7280;
    }
    
    .appointment-notes {
      font-style: italic;
      color: #9ca3af !important;
    }
    
    .appointment-status-container {
      text-align: center;
    }
    
    .reminder-status {
      font-size: 0.75rem;
      color: #16a34a;
      margin-top: 0.25rem;
    }
    
    .calendar-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .calendar-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .nav-btn {
      background: #f3f4f6;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      color: #374151;
      transition: background 0.2s ease;
    }
    
    .nav-btn:hover {
      background: #e5e7eb;
    }
    
    .calendar-grid {
      display: grid;
      grid-template-columns: 80px repeat(7, 1fr);
    }
    
    .calendar-times {
      background: #f9fafb;
      border-right: 1px solid #e5e7eb;
    }
    
    .time-header {
      padding: 1rem 0.5rem;
      font-weight: 600;
      text-align: center;
      background: #f3f4f6;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .time-cell {
      padding: 0.5rem;
      border-bottom: 1px solid #e5e7eb;
      text-align: center;
      font-size: 0.8rem;
      color: #6b7280;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .day-header {
      padding: 1rem 0.5rem;
      text-align: center;
      background: #f3f4f6;
      border-bottom: 1px solid #e5e7eb;
      border-right: 1px solid #e5e7eb;
    }
    
    .day-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: #1f2937;
    }
    
    .day-date {
      font-size: 0.8rem;
      color: #6b7280;
    }
    
    .calendar-cell {
      border-right: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
      min-height: 60px;
      padding: 0.25rem;
      position: relative;
    }
    
    .calendar-appointment {
      background: #dbeafe;
      color: #1e40af;
      padding: 0.25rem;
      border-radius: 4px;
      font-size: 0.75rem;
      margin-bottom: 0.125rem;
      cursor: pointer;
    }
    
    .calendar-appointment.confirmed {
      background: #dcfce7;
      color: #16a34a;
    }
    
    .calendar-appointment.completed {
      background: #e0e7ff;
      color: #4338ca;
    }
    
    .appointment-title {
      font-weight: 600;
      margin-bottom: 0.125rem;
    }
    
    .appointment-type {
      font-size: 0.7rem;
      opacity: 0.8;
    }
    
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      color: #6b7280;
    }
    
    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
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
    
    .appointment-form {
      padding: 1.5rem;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
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
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .form-textarea {
      min-height: 80px;
      resize: vertical;
    }
    
    .error-message {
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 0.25rem;
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
      background: #0ea5e9;
      color: white;
      border: none;
    }

    .btn.primary:hover:not(:disabled) {
      background: #0284c7;
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
    
    .appointment-details {
      padding: 1.5rem;
    }
    
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .detail-item {
      padding: 1rem;
      background: #f9fafb;
      border-radius: 6px;
    }
    
    .detail-item strong {
      color: #374151;
      font-weight: 600;
      display: block;
      margin-bottom: 0.25rem;
    }
    
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: capitalize;
    }
    
    .status-badge.scheduled {
      background: #fef3c7;
      color: #d97706;
    }
    
    .status-badge.confirmed {
      background: #dcfce7;
      color: #16a34a;
    }
    
    .status-badge.completed {
      background: #e0e7ff;
      color: #4338ca;
    }
    
    .status-badge.cancelled {
      background: #fee2e2;
      color: #dc2626;
    }
    
    .notes-section,
    .reminder-section {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    
    .notes-section strong,
    .reminder-section strong {
      color: #374151;
      font-weight: 600;
      display: block;
      margin-bottom: 0.5rem;
    }
    
    .notes-section p,
    .reminder-section p {
      margin: 0;
      line-height: 1.5;
      color: #374151;
    }
    
    @media (max-width: 768px) {
      .appointments-container {
        padding: 1rem;
      }
      
      .appointments-header {
        flex-direction: column;
        gap: 1rem;
      }
      
      .appointments-controls {
        flex-direction: column;
      }
      
      .filter-container {
        flex-direction: column;
      }
      
      .appointment-item {
        grid-template-columns: 1fr;
        gap: 1rem;
        text-align: center;
      }
      
      .form-grid {
        grid-template-columns: 1fr;
      }
      
      .detail-grid {
        grid-template-columns: 1fr;
      }
      
      .schedule-grid {
        grid-template-columns: 1fr;
      }
      
      .calendar-grid {
        grid-template-columns: 1fr;
      }
      
      .modal-overlay {
        padding: 1rem;
      }
    }
  `]
})
export class AppointmentsComponent implements OnInit {
  activeTab = 'today';
  tabs = [
    { key: 'today', label: "Today's Schedule" },
    { key: 'all', label: 'All Appointments' },
    { key: 'calendar', label: 'Calendar View' }
  ];

  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  todayAppointments: Appointment[] = [];
  todaySlots: TimeSlot[] = [];
  
  patients: Patient[] = [];
  searchQuery = '';
  statusFilter = '';
  dateFilter = '';
  
  showScheduleModal = false;
  showViewModal = false;
  editingAppointment: Appointment | null = null;
  selectedAppointment: Appointment | null = null;
  
  appointmentForm: FormGroup;
  appointmentTypes = Object.values(AppointmentType);
  availableSlots: TimeSlot[] = [];
  
  // Calendar view properties
  currentWeekStart: Date = new Date();
  currentWeekEnd: Date = new Date();
  currentWeekDays: Date[] = [];
  workingHours: string[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private fb: FormBuilder,
    private translationService: TranslationService
  ) {
    this.appointmentForm = this.createAppointmentForm();
    this.initializeWeek();
    this.generateWorkingHours();
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.appointmentService.getAppointments().subscribe(appointments => {
      this.appointments = appointments;
      this.filterAppointments();
      this.loadTodayData();
    });

    this.patientService.getPatients().subscribe(patients => {
      this.patients = patients;
    });
  }

  loadTodayData() {
    const today = new Date();
    this.todayAppointments = this.appointmentService.getAppointmentsByDate(today);
    this.todaySlots = this.appointmentService.getAvailableSlots(today);
  }

  createAppointmentForm(): FormGroup {
    return this.fb.group({
      patientId: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      startTime: ['', Validators.required],
      type: ['', Validators.required],
      duration: [30, Validators.required],
      doctorName: ['Dr. Smith'],
      notes: ['']
    });
  }

  filterAppointments() {
    let filtered = [...this.appointments];

    if (this.searchQuery.trim()) {
      filtered = filtered.filter(appointment =>
        appointment.patientName.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(appointment =>
        appointment.status === this.statusFilter
      );
    }

    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter);
      filtered = filtered.filter(appointment =>
        this.isSameDay(appointment.appointmentDate, filterDate)
      );
    }

    filtered.sort((a, b) => {
      const dateComparison = a.appointmentDate.getTime() - b.appointmentDate.getTime();
      if (dateComparison !== 0) return dateComparison;
      return a.startTime.localeCompare(b.startTime);
    });

    this.filteredAppointments = filtered;
  }

  onDateChange() {
    const dateValue = this.appointmentForm.get('appointmentDate')?.value;
    if (dateValue) {
      const selectedDate = new Date(dateValue);
      this.availableSlots = this.appointmentService.getAvailableSlots(selectedDate);
    }
  }

  viewAppointment(appointment: Appointment) {
    this.selectedAppointment = appointment;
    this.showViewModal = true;
  }

  editAppointment(appointment: Appointment) {
    this.editingAppointment = appointment;
    this.populateForm(appointment);
    this.showScheduleModal = true;
  }

  populateForm(appointment: Appointment) {
    this.appointmentForm.patchValue({
      patientId: appointment.patientId,
      appointmentDate: appointment.appointmentDate.toISOString().split('T')[0],
      startTime: appointment.startTime,
      type: appointment.type,
      duration: appointment.duration,
      doctorName: appointment.doctorName,
      notes: appointment.notes
    });
    this.onDateChange();
  }

  confirmAppointment(id: string) {
    this.appointmentService.confirmAppointment(id);
  }

  cancelAppointment(id: string) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(id);
    }
  }

  markCompleted(id: string) {
    this.appointmentService.markAsCompleted(id);
  }

  sendReminder(id: string) {
    this.appointmentService.sendReminder(id);
  }

  onSubmit() {
    if (this.appointmentForm.valid) {
      const formData = this.appointmentForm.value;
      
      const appointmentData: CreateAppointmentRequest = {
        ...formData,
        appointmentDate: new Date(formData.appointmentDate)
      };

      if (this.editingAppointment) {
        this.appointmentService.updateAppointment(this.editingAppointment.id, appointmentData).subscribe();
      } else {
        this.appointmentService.createAppointment(appointmentData).subscribe();
      }

      this.closeModal();
    }
  }

  closeModal() {
    this.showScheduleModal = false;
    this.showViewModal = false;
    this.editingAppointment = null;
    this.selectedAppointment = null;
    this.appointmentForm.reset();
    this.appointmentForm = this.createAppointmentForm();
    this.availableSlots = [];
  }

  // Calendar view methods
  initializeWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    this.currentWeekStart = new Date(today);
    this.currentWeekStart.setDate(today.getDate() + mondayOffset);
    
    this.currentWeekEnd = new Date(this.currentWeekStart);
    this.currentWeekEnd.setDate(this.currentWeekStart.getDate() + 6);
    
    this.generateWeekDays();
  }

  generateWeekDays() {
    this.currentWeekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(this.currentWeekStart);
      day.setDate(this.currentWeekStart.getDate() + i);
      this.currentWeekDays.push(day);
    }
  }

  generateWorkingHours() {
    this.workingHours = [];
    for (let hour = 9; hour < 17; hour++) {
      this.workingHours.push(`${hour.toString().padStart(2, '0')}:00`);
      this.workingHours.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  previousWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.currentWeekEnd.setDate(this.currentWeekEnd.getDate() - 7);
    this.generateWeekDays();
  }

  nextWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.currentWeekEnd.setDate(this.currentWeekEnd.getDate() + 7);
    this.generateWeekDays();
  }

  getAppointmentsForTimeSlot(date: Date, time: string): Appointment[] {
    return this.appointments.filter(appointment =>
      this.isSameDay(appointment.appointmentDate, date) && appointment.startTime === time
    );
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  getAppointmentTypeTranslation(type: string): string {
    const typeMap: { [key: string]: string } = {
      'CLEANING': 'appointments.types.cleaning',
      'CHECKUP': 'appointments.types.checkup',
      'FILLING': 'appointments.types.filling',
      'EXTRACTION': 'appointments.types.extraction',
      'ROOT_CANAL': 'appointments.types.rootCanal',
      'CROWN': 'appointments.types.crown',
      'CONSULTATION': 'appointments.types.consultation',
      'FOLLOW_UP': 'appointments.types.followUp',
      'EMERGENCY': 'appointments.types.emergency'
    };

    const translationKey = typeMap[type] || type;
    return this.translationService.translate(translationKey);
  }
}
