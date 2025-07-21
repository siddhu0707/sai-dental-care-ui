import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient.model';
import { Appointment } from '../models/appointment.model';
import { Bill, Payment, ServiceTemplate } from '../models/billing.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3001';

  constructor(private http: HttpClient) {}

  // Patient endpoints
  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.baseUrl}/patients`);
  }

  getPatient(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.baseUrl}/patients/${id}`);
  }

  createPatient(patient: any): Observable<Patient> {
    return this.http.post<Patient>(`${this.baseUrl}/patients`, patient);
  }

  updatePatient(id: string, patient: Partial<Patient>): Observable<Patient> {
    return this.http.patch<Patient>(`${this.baseUrl}/patients/${id}`, patient);
  }

  deletePatient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/patients/${id}`);
  }

  // Appointment endpoints
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments`);
  }

  getAppointment(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.baseUrl}/appointments/${id}`);
  }

  createAppointment(appointment: Omit<Appointment, 'id'>): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.baseUrl}/appointments`, appointment);
  }

  updateAppointment(id: string, appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/appointments/${id}`, appointment);
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/appointments/${id}`);
  }

  // Bill endpoints
  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.baseUrl}/bills`);
  }

  getBill(id: string): Observable<Bill> {
    return this.http.get<Bill>(`${this.baseUrl}/bills/${id}`);
  }

  createBill(bill: Omit<Bill, 'id'>): Observable<Bill> {
    return this.http.post<Bill>(`${this.baseUrl}/bills`, bill);
  }

  updateBill(id: string, bill: Partial<Bill>): Observable<Bill> {
    return this.http.patch<Bill>(`${this.baseUrl}/bills/${id}`, bill);
  }

  deleteBill(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/bills/${id}`);
  }

  // Payment endpoints
  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.baseUrl}/payments`);
  }

  createPayment(payment: Omit<Payment, 'id'>): Observable<Payment> {
    return this.http.post<Payment>(`${this.baseUrl}/payments`, payment);
  }

  // Service Template endpoints
  getServiceTemplates(): Observable<ServiceTemplate[]> {
    return this.http.get<ServiceTemplate[]>(`${this.baseUrl}/serviceTemplates`);
  }

  createServiceTemplate(template: Omit<ServiceTemplate, 'id'>): Observable<ServiceTemplate> {
    return this.http.post<ServiceTemplate>(`${this.baseUrl}/serviceTemplates`, template);
  }
}
