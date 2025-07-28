import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { Patient, CreatePatientRequest } from '../../models/patient.model';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="patients-container">
      <header class="patients-header">
        <div class="header-left">
          <h1 class="page-title">{{ 'patients.title' | translate }}</h1>
          <p class="page-subtitle">{{ 'patients.subtitle' | translate }}</p>
        </div>
        <div class="header-right">
          <button (click)="showAddPatientModal = true" class="add-patient-btn">
            <span class="btn-icon">➕</span>
            {{ 'patients.addNew' | translate }}
          </button>
        </div>
      </header>
      
      <div class="patients-controls">
        <div class="search-container">
          <input
            type="text"
            [placeholder]="'patients.searchPlaceholder' | translate"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            class="search-input"
          >
          <span class="search-icon">🔍</span>
        </div>

        <div class="filter-container">
          <select [(ngModel)]="sortBy" (change)="onSort()" class="sort-select">
            <option value="name">{{ 'patients.sortByName' | translate }}</option>
            <option value="date">{{ 'patients.sortByDate' | translate }}</option>
            <option value="lastVisit">{{ 'patients.sortByLastVisit' | translate }}</option>
          </select>
        </div>
      </div>
      
      <div class="patients-grid">
        <div *ngFor="let patient of filteredPatients" class="patient-card">
          <div class="patient-avatar">
            {{ patient.firstName.charAt(0) }}{{ patient.lastName.charAt(0) }}
          </div>
          <div class="patient-info">
            <h3 class="patient-name">{{ patient.firstName }} {{ patient.lastName }}</h3>
            <p class="patient-contact">📧 {{ patient.email }}</p>
            <p class="patient-contact">📞 {{ patient.phone }}</p>
            <p class="patient-stats">
              <span class="stat">{{ 'patients.totalVisits' | translate }}: {{ patient.totalVisits }}</span>
              <span class="stat" *ngIf="patient.lastVisit">
                {{ 'patients.lastVisit' | translate }}: {{ patient.lastVisit | date:'MMM d, y' }}
              </span>
            </p>
          </div>
          <div class="patient-actions">
            <button (click)="viewPatient(patient)" class="action-btn view">{{ 'common.view' | translate }}</button>
            <button (click)="editPatient(patient)" class="action-btn edit">{{ 'common.edit' | translate }}</button>
            <button (click)="deletePatient(patient.id)" class="action-btn delete">{{ 'common.delete' | translate }}</button>
          </div>
        </div>
        
        <div *ngIf="filteredPatients.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>{{ 'patients.noPatients' | translate }}</h3>
          <p>{{ searchQuery ? ('patients.adjustSearch' | translate) : ('patients.addFirstPatient' | translate) }}</p>
        </div>
      </div>
    </div>
    
    <!-- Add/Edit Patient Modal -->
    <div *ngIf="showAddPatientModal || showEditPatientModal" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ showAddPatientModal ? ('patients.addNew' | translate) : ('patients.editPatient' | translate) }}</h2>
          <button (click)="closeModal()" class="close-btn">✕</button>
        </div>

        <form [formGroup]="patientForm" (ngSubmit)="onSubmit()" class="patient-form">
          <div class="form-grid">
            <div class="form-group">
              <label>{{ 'patients.firstName' | translate }} *</label>
              <input type="text" formControlName="firstName" class="form-input" />
              <div *ngIf="patientForm.get('firstName')?.errors?.['required'] && patientForm.get('firstName')?.touched"
                   class="error-message">{{ 'validation.firstNameRequired' | translate }}</div>
            </div>

            <div class="form-group">
              <label>{{ 'patients.lastName' | translate }} *</label>
              <input type="text" formControlName="lastName" class="form-input" />
              <div *ngIf="patientForm.get('lastName')?.errors?.['required'] && patientForm.get('lastName')?.touched"
                   class="error-message">{{ 'validation.lastNameRequired' | translate }}</div>
            </div>

            <div class="form-group">
              <label>{{ 'common.email' | translate }} *</label>
              <input type="email" formControlName="email" class="form-input" />
              <div *ngIf="patientForm.get('email')?.errors?.['required'] && patientForm.get('email')?.touched"
                   class="error-message">{{ 'validation.emailRequired' | translate }}</div>
              <div *ngIf="patientForm.get('email')?.errors?.['email'] && patientForm.get('email')?.touched"
                   class="error-message">{{ 'validation.emailValid' | translate }}</div>
            </div>

            <div class="form-group">
              <label>{{ 'common.phone' | translate }} *</label>
              <input type="tel" formControlName="phone" class="form-input" />
              <div *ngIf="patientForm.get('phone')?.errors?.['required'] && patientForm.get('phone')?.touched"
                   class="error-message">{{ 'validation.phoneRequired' | translate }}</div>
            </div>

            <div class="form-group">
              <label>{{ 'patients.dateOfBirth' | translate }} *</label>
              <input type="date" formControlName="dateOfBirth" class="form-input" />
              <div *ngIf="patientForm.get('dateOfBirth')?.errors?.['required'] && patientForm.get('dateOfBirth')?.touched"
                   class="error-message">{{ 'validation.dateOfBirthRequired' | translate }}</div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>{{ 'common.address' | translate }}</h3>
            <div formGroupName="address" class="form-grid">
              <div class="form-group full-width">
                <label>{{ 'patients.address.street' | translate }}</label>
                <input type="text" formControlName="street" class="form-input" />
              </div>

              <div class="form-group">
                <label>{{ 'patients.address.city' | translate }}</label>
                <input type="text" formControlName="city" class="form-input" />
              </div>

              <div class="form-group">
                <label>{{ 'patients.address.state' | translate }}</label>
                <input type="text" formControlName="state" class="form-input" />
              </div>

              <div class="form-group">
                <label>{{ 'patients.address.zipCode' | translate }}</label>
                <input type="text" formControlName="zipCode" class="form-input" />
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>{{ 'patients.emergencyContact' | translate }}</h3>
            <div formGroupName="emergencyContact" class="form-grid">
              <div class="form-group">
                <label>{{ 'common.name' | translate }}</label>
                <input type="text" formControlName="name" class="form-input" />
              </div>

              <div class="form-group">
                <label>{{ 'common.phone' | translate }}</label>
                <input type="tel" formControlName="phone" class="form-input" />
              </div>

              <div class="form-group">
                <label>{{ 'patients.relationship' | translate }}</label>
                <select formControlName="relationship" class="form-input">
                  <option value="">{{ 'patients.selectRelationship' | translate }}</option>
                  <option value="Spouse">{{ 'patients.relationships.spouse' | translate }}</option>
                  <option value="Parent">{{ 'patients.relationships.parent' | translate }}</option>
                  <option value="Child">{{ 'patients.relationships.child' | translate }}</option>
                  <option value="Sibling">{{ 'patients.relationships.sibling' | translate }}</option>
                  <option value="Friend">{{ 'patients.relationships.friend' | translate }}</option>
                  <option value="Other">{{ 'patients.relationships.other' | translate }}</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>{{ 'patients.medicalInfo' | translate }}</h3>
            <div class="form-group full-width">
              <label>{{ 'patients.medicalHistory' | translate }} ({{ 'patients.commaSeparated' | translate }})</label>
              <textarea formControlName="medicalHistory" class="form-textarea"
                       [placeholder]="'patients.medicalHistoryPlaceholder' | translate"></textarea>
            </div>

            <div class="form-group full-width">
              <label>{{ 'patients.allergies' | translate }} ({{ 'patients.commaSeparated' | translate }})</label>
              <textarea formControlName="allergies" class="form-textarea"
                       [placeholder]="'patients.allergiesPlaceholder' | translate"></textarea>
            </div>
          </div>

          <div class="form-section">
            <div class="form-group full-width">
              <label>{{ 'common.notes' | translate }}</label>
              <textarea formControlName="notes" class="form-textarea"
                       [placeholder]="'patients.notesPlaceholder' | translate"></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" (click)="closeModal()" class="btn secondary">{{ 'common.cancel' | translate }}</button>
            <button type="submit" [disabled]="patientForm.invalid" class="btn primary">
              {{ showAddPatientModal ? ('patients.addPatient' | translate) : ('patients.updatePatient' | translate) }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Patient Detail Modal -->
    <div *ngIf="showViewPatientModal" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ 'patients.patientDetails' | translate }}</h2>
          <button (click)="closeModal()" class="close-btn">✕</button>
        </div>
        
        <div *ngIf="selectedPatient" class="patient-details">
          <div class="patient-header">
            <div class="patient-avatar large">
              {{ selectedPatient.firstName.charAt(0) }}{{ selectedPatient.lastName.charAt(0) }}
            </div>
            <div class="patient-info">
              <h2>{{ selectedPatient.firstName }} {{ selectedPatient.lastName }}</h2>
              <p class="patient-meta">
                {{ 'patients.patientId' | translate }}: {{ selectedPatient.id }} •
                {{ 'patients.registered' | translate }}: {{ selectedPatient.registrationDate | date:'MMM d, y' }}
              </p>
            </div>
          </div>

          <div class="details-grid">
            <div class="detail-section">
              <h3>{{ 'patients.contactInfo' | translate }}</h3>
              <div class="detail-item">
                <strong>{{ 'common.email' | translate }}:</strong> {{ selectedPatient.email }}
              </div>
              <div class="detail-item">
                <strong>{{ 'common.phone' | translate }}:</strong> {{ selectedPatient.phone }}
              </div>
              <div class="detail-item">
                <strong>{{ 'patients.dateOfBirth' | translate }}:</strong> {{ selectedPatient.dateOfBirth | date:'MMM d, y' }}
              </div>
              <div class="detail-item">
                <strong>{{ 'common.address' | translate }}:</strong><br>
                {{ selectedPatient.address.street }}<br>
                {{ selectedPatient.address.city }}, {{ selectedPatient.address.state }} {{ selectedPatient.address.zipCode }}
              </div>
            </div>
            
            <div class="detail-section">
              <h3>{{ 'patients.emergencyContact' | translate }}</h3>
              <div class="detail-item">
                <strong>{{ 'common.name' | translate }}:</strong> {{ selectedPatient.emergencyContact.name }}
              </div>
              <div class="detail-item">
                <strong>{{ 'common.phone' | translate }}:</strong> {{ selectedPatient.emergencyContact.phone }}
              </div>
              <div class="detail-item">
                <strong>{{ 'patients.relationship' | translate }}:</strong> {{ selectedPatient.emergencyContact.relationship }}
              </div>
            </div>

            <div class="detail-section">
              <h3>{{ 'patients.medicalInfo' | translate }}</h3>
              <div class="detail-item">
                <strong>{{ 'patients.medicalHistory' | translate }}:</strong>
                <ul *ngIf="selectedPatient.medicalHistory.length > 0; else noMedicalHistory">
                  <li *ngFor="let condition of selectedPatient.medicalHistory">{{ condition }}</li>
                </ul>
                <ng-template #noMedicalHistory>
                  <span class="no-data">{{ 'patients.noMedicalHistory' | translate }}</span>
                </ng-template>
              </div>
              <div class="detail-item">
                <strong>{{ 'patients.allergies' | translate }}:</strong>
                <ul *ngIf="selectedPatient.allergies.length > 0; else noAllergies">
                  <li *ngFor="let allergy of selectedPatient.allergies">{{ allergy }}</li>
                </ul>
                <ng-template #noAllergies>
                  <span class="no-data">{{ 'patients.noAllergies' | translate }}</span>
                </ng-template>
              </div>
            </div>

            <div class="detail-section">
              <h3>{{ 'patients.visitInfo' | translate }}</h3>
              <div class="detail-item">
                <strong>{{ 'patients.totalVisits' | translate }}:</strong> {{ selectedPatient.totalVisits }}
              </div>
              <div class="detail-item">
                <strong>{{ 'patients.lastVisit' | translate }}:</strong>
                <span *ngIf="selectedPatient.lastVisit; else noLastVisit">
                  {{ selectedPatient.lastVisit | date:'MMM d, y' }}
                </span>
                <ng-template #noLastVisit>
                  <span class="no-data">{{ 'patients.noVisits' | translate }}</span>
                </ng-template>
              </div>
              <div class="detail-item" *ngIf="selectedPatient.nextAppointment">
                <strong>{{ 'patients.nextAppointment' | translate }}:</strong> {{ selectedPatient.nextAppointment | date:'MMM d, y' }}
              </div>
            </div>
          </div>

          <div *ngIf="selectedPatient.notes" class="notes-section">
            <h3>{{ 'common.notes' | translate }}</h3>
            <p>{{ selectedPatient.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .patients-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .patients-header {
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
    
    .add-patient-btn {
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

    .add-patient-btn:hover {
      background: #0284c7;
    }
    
    .btn-icon {
      margin-right: 0.5rem;
    }
    
    .patients-controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
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
    
    .sort-select {
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      background: white;
    }
    
    .patients-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }
    
    .patient-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .patient-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .patient-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
    
    .patient-avatar.large {
      width: 80px;
      height: 80px;
      font-size: 1.5rem;
    }
    
    .patient-name {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .patient-contact {
      margin: 0.25rem 0;
      color: #6b7280;
      font-size: 0.9rem;
    }
    
    .patient-stats {
      margin-top: 0.75rem;
      display: flex;
      gap: 1rem;
    }
    
    .stat {
      font-size: 0.8rem;
      color: #6b7280;
    }
    
    .patient-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    
    .action-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .action-btn.view {
      background: #e5e7eb;
      color: #374151;
    }
    
    .action-btn.view:hover {
      background: #d1d5db;
    }
    
    .action-btn.edit {
      background: #fef3c7;
      color: #d97706;
    }
    
    .action-btn.edit:hover {
      background: #fde68a;
    }
    
    .action-btn.delete {
      background: #fee2e2;
      color: #dc2626;
    }
    
    .action-btn.delete:hover {
      background: #fecaca;
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
    
    .modal-content.large {
      max-width: 800px;
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
    
    .patient-form {
      padding: 1.5rem;
    }
    
    .form-section {
      margin-bottom: 2rem;
    }
    
    .form-section h3 {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 0.5rem;
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
    
    .patient-details {
      padding: 1.5rem;
    }
    
    .patient-header {
      display: flex;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .patient-header .patient-info {
      margin-left: 1.5rem;
    }
    
    .patient-header h2 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .patient-meta {
      margin: 0.5rem 0 0 0;
      color: #6b7280;
      font-size: 0.9rem;
    }
    
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .detail-section {
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 8px;
    }
    
    .detail-section h3 {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .detail-item {
      margin-bottom: 1rem;
      line-height: 1.5;
    }
    
    .detail-item:last-child {
      margin-bottom: 0;
    }
    
    .detail-item strong {
      color: #374151;
      font-weight: 600;
    }
    
    .detail-item ul {
      margin: 0.5rem 0 0 1rem;
      padding: 0;
    }
    
    .no-data {
      color: #9ca3af;
      font-style: italic;
    }
    
    .notes-section {
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 8px;
    }
    
    .notes-section h3 {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .notes-section p {
      margin: 0;
      line-height: 1.6;
      color: #374151;
    }
    
    @media (max-width: 768px) {
      .patients-container {
        padding: 1rem;
      }
      
      .patients-header {
        flex-direction: column;
        gap: 1rem;
      }
      
      .patients-controls {
        flex-direction: column;
      }
      
      .patients-grid {
        grid-template-columns: 1fr;
      }
      
      .form-grid {
        grid-template-columns: 1fr;
      }
      
      .details-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .modal-overlay {
        padding: 1rem;
      }
    }
  `]
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  searchQuery = '';
  sortBy = 'name';
  
  showAddPatientModal = false;
  showEditPatientModal = false;
  showViewPatientModal = false;
  selectedPatient: Patient | null = null;
  
  patientForm: FormGroup;
  
  constructor(
    private patientService: PatientService,
    private fb: FormBuilder
  ) {
    this.patientForm = this.createPatientForm();
  }
  
  ngOnInit() {
    this.patientService.getPatients().subscribe(patients => {
      this.patients = patients;
      this.applyFilters();
    });
  }
  
  createPatientForm(): FormGroup {
    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      address: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        zipCode: ['']
      }),
      emergencyContact: this.fb.group({
        name: [''],
        phone: [''],
        relationship: ['']
      }),
      medicalHistory: [''],
      allergies: [''],
      notes: ['']
    });
  }
  
  onSearch() {
    this.applyFilters();
  }
  
  onSort() {
    this.applyFilters();
  }
  
  applyFilters() {
    let filtered = [...this.patients];
    
    // Apply search filter
    if (this.searchQuery.trim()) {
      filtered = this.patientService.searchPatients(this.searchQuery);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return (a.firstName + ' ' + a.lastName).localeCompare(b.firstName + ' ' + b.lastName);
        case 'date':
          return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
        case 'lastVisit':
          if (!a.lastVisit && !b.lastVisit) return 0;
          if (!a.lastVisit) return 1;
          if (!b.lastVisit) return -1;
          return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
        default:
          return 0;
      }
    });
    
    this.filteredPatients = filtered;
  }
  
  viewPatient(patient: Patient) {
    this.selectedPatient = patient;
    this.showViewPatientModal = true;
  }
  
  editPatient(patient: Patient) {
    this.selectedPatient = patient;
    this.populateForm(patient);
    this.showEditPatientModal = true;
  }
  
  deletePatient(patientId: string) {
    if (confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      this.patientService.deletePatient(patientId).subscribe();
    }
  }
  
  populateForm(patient: Patient) {
    this.patientForm.patchValue({
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth.toISOString().split('T')[0],
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      medicalHistory: patient.medicalHistory.join(', '),
      allergies: patient.allergies.join(', '),
      notes: patient.notes
    });
  }
  
  onSubmit() {
    if (this.patientForm.valid) {
      const formData = this.patientForm.value;

      const patientData: CreatePatientRequest = {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth),
        medicalHistory: formData.medicalHistory ? formData.medicalHistory.split(',').map((item: string) => item.trim()).filter((item: string) => item) : [],
        allergies: formData.allergies ? formData.allergies.split(',').map((item: string) => item.trim()).filter((item: string) => item) : []
      };

      if (this.showAddPatientModal) {
        this.patientService.addPatient(patientData).subscribe(() => {
          this.closeModal();
        });
      } else if (this.showEditPatientModal && this.selectedPatient) {
        this.patientService.updatePatient(this.selectedPatient.id, patientData).subscribe(() => {
          this.closeModal();
        });
      }
    }
  }
  
  closeModal() {
    this.showAddPatientModal = false;
    this.showEditPatientModal = false;
    this.showViewPatientModal = false;
    this.selectedPatient = null;
    this.patientForm.reset();
    this.patientForm = this.createPatientForm();
  }
}
