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
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
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
