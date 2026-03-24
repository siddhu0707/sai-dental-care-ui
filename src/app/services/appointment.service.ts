import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Appointment, CreateAppointmentRequest, AppointmentType, AppointmentStatus, TimeSlot, DaySchedule } from '../models/appointment.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  public appointments$ = this.appointmentsSubject.asObservable();

  private workingHours = {
    start: '09:00',
    end: '21:00',
    slotDuration: 30 // minutes
  };

  constructor(private apiService: ApiService) {
    this.loadAppointments();
  }

  private loadAppointments() {
    this.apiService.getAppointments().pipe(
      tap(appointments => {
        const processedAppointments = appointments.map(appointment => ({
          ...appointment,
          appointmentDate: new Date(appointment.appointmentDate),
          createdDate: new Date(appointment.createdDate),
          updatedDate: new Date(appointment.updatedDate)
        }));
        this.appointmentsSubject.next(processedAppointments);
      }),
      catchError(error => {
        console.error('Error loading appointments:', error);
        return throwError(() => error);
      })
    ).subscribe();
  }

  getAppointments(): Observable<Appointment[]> {
    return this.appointments$;
  }

  getAppointmentById(id: string): Appointment | undefined {
    return this.appointmentsSubject.value.find(appointment => appointment.id === id);
  }

  getAppointmentsByDate(date: Date): Appointment[] {
    return this.appointmentsSubject.value.filter(appointment =>
      this.isSameDay(appointment.appointmentDate, date)
    );
  }

  getAppointmentsByPatient(patientId: string): Appointment[] {
    return this.appointmentsSubject.value.filter(appointment =>
      appointment.patientId === patientId
    );
  }

  getTodaysAppointments(): Appointment[] {
    const today = new Date();
    return this.getAppointmentsByDate(today);
  }

  getUpcomingAppointments(days: number = 7): Appointment[] {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.appointmentsSubject.value.filter(appointment =>
      appointment.appointmentDate >= today && appointment.appointmentDate <= futureDate
    ).sort((a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime());
  }

  createAppointment(appointmentData: CreateAppointmentRequest): Observable<Appointment> {
    const endTime = this.calculateEndTime(appointmentData.startTime, appointmentData.duration);
    const newAppointment: any = {
      ...appointmentData,
      endTime,
      status: AppointmentStatus.SCHEDULED,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      reminder: {
        sent: false
      }
    };
    return this.apiService.createAppointment(newAppointment).pipe(
      tap(() => this.loadAppointments()),
      catchError(error => {
        console.error('Error creating appointment:', error);
        return throwError(() => error);
      })
    );
  }

  updateAppointment(id: string, appointmentData: Partial<Appointment>): Observable<Appointment> {
    return this.apiService.updateAppointment(id, appointmentData).pipe(
      tap(() => this.loadAppointments()),
      catchError(error => {
        console.error('Error updating appointment:', error);
        return throwError(() => error);
      })
    );
  }

  deleteAppointment(id: string): Observable<void> {
    return this.apiService.deleteAppointment(id).pipe(
      tap(() => this.loadAppointments()),
      catchError(error => {
        console.error('Error deleting appointment:', error);
        return throwError(() => error);
      })
    );
  }

  getAvailableSlots(date: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const appointments = this.getAppointmentsByDate(date);

    const startTime = this.parseTime(this.workingHours.start);
    const endTime = this.parseTime(this.workingHours.end);

    let currentTime = startTime;

    while (currentTime < endTime) {
      const timeString = this.formatTime(currentTime);
      const isBooked = appointments.some(appointment =>
        appointment.startTime === timeString
      );

      const bookedAppointment = appointments.find(appointment =>
        appointment.startTime === timeString
      );

      slots.push({
        time: timeString,
        available: !isBooked,
        appointmentId: bookedAppointment?.id
      });

      currentTime = new Date(currentTime.getTime() + this.workingHours.slotDuration * 60000);
    }

    return slots;
  }

  getDaySchedule(date: Date): DaySchedule {
    return {
      date,
      timeSlots: this.getAvailableSlots(date)
    };
  }

  confirmAppointment(id: string): void {
    this.updateAppointment(id, {
      status: AppointmentStatus.CONFIRMED
    }).subscribe();
  }

  cancelAppointment(id: string): void {
    this.updateAppointment(id, {
      status: AppointmentStatus.CANCELLED
    }).subscribe();
  }

  markAsCompleted(id: string): void {
    this.updateAppointment(id, {
      status: AppointmentStatus.COMPLETED
    }).subscribe();
  }

  rescheduleAppointment(id: string, newDate: Date, newTime: string): void {
    this.updateAppointment(id, {
      appointmentDate: newDate,
      startTime: newTime,
      endTime: this.calculateEndTime(newTime, this.getAppointmentById(id)?.duration || 30),
      status: AppointmentStatus.RESCHEDULED
    }).subscribe();
  }

  sendReminder(id: string): void {
    this.updateAppointment(id, {
      reminder: {
        sent: true,
        sentDate: new Date()
      }
    }).subscribe();
  }

  private generateId(): string {
    return 'appointment_' + Math.random().toString(36).substr(2, 9);
  }

  // private getPatientNameById(patientId: string): string {
  //   // In a real app, this would fetch from the patient service
  //   const mockPatients: { [key: string]: string } = {
  //     'patient_001': 'John Doe',
  //     'patient_002': 'Sarah Wilson',
  //     'patient_003': 'Mike Johnson'
  //   };
  //   return mockPatients[patientId] || 'Unknown Patient';
  // }

  private calculateEndTime(startTime: string, duration: number): string {
    const start = this.parseTime(startTime);
    const end = new Date(start.getTime() + duration * 60000);
    return this.formatTime(end);
  }

  private parseTime(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  private formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  // private getMockAppointments(): Appointment[] {
  //   ...
  // }
}
