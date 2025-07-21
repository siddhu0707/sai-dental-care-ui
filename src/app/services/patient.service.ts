import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Patient, CreatePatientRequest } from '../models/patient.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private patientsSubject = new BehaviorSubject<Patient[]>([]);
  public patients$ = this.patientsSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadPatients();
  }

  private loadPatients() {
    this.apiService.getPatients().subscribe(patients => {
      // Convert date strings to Date objects
      const processedPatients = patients.map(patient => ({
        ...patient,
        dateOfBirth: new Date(patient.dateOfBirth),
        registrationDate: new Date(patient.registrationDate),
        lastVisit: patient.lastVisit ? new Date(patient.lastVisit) : undefined,
        nextAppointment: patient.nextAppointment ? new Date(patient.nextAppointment) : undefined
      }));
      this.patientsSubject.next(processedPatients);
    });
  }

  getPatients(): Observable<Patient[]> {
    return this.patients$;
  }

  getPatientById(id: string): Patient | undefined {
    return this.patientsSubject.value.find(patient => patient.id === id);
  }

  addPatient(patientData: CreatePatientRequest): Observable<Patient> {
    const newPatient: any = {
      ...patientData,
      id: this.generateId(),
      registrationDate: new Date().toISOString(),
      totalVisits: 0,
      notes: patientData.notes || ''
    };

    return this.apiService.createPatient(newPatient).pipe(
      tap(() => this.loadPatients())
    );
  }

  updatePatient(id: string, patientData: Partial<Patient>): Observable<Patient> {
    return this.apiService.updatePatient(id, patientData).pipe(
      tap(() => this.loadPatients())
    );
  }

  deletePatient(id: string): Observable<void> {
    return this.apiService.deletePatient(id).pipe(
      tap(() => this.loadPatients())
    );
  }

  searchPatients(query: string): Patient[] {
    const allPatients = this.patientsSubject.value;
    const lowercaseQuery = query.toLowerCase();
    
    return allPatients.filter(patient =>
      patient.firstName.toLowerCase().includes(lowercaseQuery) ||
      patient.lastName.toLowerCase().includes(lowercaseQuery) ||
      patient.email.toLowerCase().includes(lowercaseQuery) ||
      patient.phone.includes(query)
    );
  }

  private generateId(): string {
    return 'patient_' + Math.random().toString(36).substr(2, 9);
  }

  private getMockPatients(): Patient[] {
    return [
      {
        id: 'patient_001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        dateOfBirth: new Date('1985-03-15'),
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        },
        medicalHistory: ['Hypertension', 'Diabetes Type 2'],
        allergies: ['Penicillin'],
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+1 (555) 123-4568',
          relationship: 'Spouse'
        },
        registrationDate: new Date('2023-01-15'),
        lastVisit: new Date('2024-01-10'),
        totalVisits: 8,
        notes: 'Regular patient, good dental hygiene'
      },
      {
        id: 'patient_002',
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@email.com',
        phone: '+1 (555) 987-6543',
        dateOfBirth: new Date('1992-07-22'),
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210'
        },
        medicalHistory: [],
        allergies: ['Latex'],
        emergencyContact: {
          name: 'Michael Wilson',
          phone: '+1 (555) 987-6544',
          relationship: 'Father'
        },
        registrationDate: new Date('2023-06-20'),
        lastVisit: new Date('2024-01-05'),
        totalVisits: 3,
        notes: 'Nervous about dental procedures'
      },
      {
        id: 'patient_003',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@email.com',
        phone: '+1 (555) 456-7890',
        dateOfBirth: new Date('1978-11-08'),
        address: {
          street: '789 Pine Rd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601'
        },
        medicalHistory: ['Heart Disease'],
        allergies: [],
        emergencyContact: {
          name: 'Lisa Johnson',
          phone: '+1 (555) 456-7891',
          relationship: 'Wife'
        },
        registrationDate: new Date('2022-09-10'),
        lastVisit: new Date('2023-12-20'),
        totalVisits: 12,
        notes: 'Requires antibiotic premedication'
      }
    ];
  }
}
