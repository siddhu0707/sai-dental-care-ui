import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Appointment, CreateAppointmentRequest, AppointmentType, AppointmentStatus, TimeSlot, DaySchedule } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>(this.getMockAppointments());
  public appointments$ = this.appointmentsSubject.asObservable();

  private workingHours = {
    start: '09:00',
    end: '17:00',
    slotDuration: 30 // minutes
  };

  constructor() {}

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

  createAppointment(appointmentData: CreateAppointmentRequest): Appointment {
    const endTime = this.calculateEndTime(appointmentData.startTime, appointmentData.duration);
    
    const newAppointment: Appointment = {
      id: this.generateId(),
      ...appointmentData,
      patientName: this.getPatientNameById(appointmentData.patientId),
      endTime,
      status: AppointmentStatus.SCHEDULED,
      createdDate: new Date(),
      updatedDate: new Date(),
      reminder: {
        sent: false
      }
    };

    const currentAppointments = this.appointmentsSubject.value;
    this.appointmentsSubject.next([...currentAppointments, newAppointment]);
    
    return newAppointment;
  }

  updateAppointment(id: string, appointmentData: Partial<Appointment>): Appointment | null {
    const currentAppointments = this.appointmentsSubject.value;
    const appointmentIndex = currentAppointments.findIndex(appointment => appointment.id === id);
    
    if (appointmentIndex === -1) {
      return null;
    }

    const updatedAppointment = { 
      ...currentAppointments[appointmentIndex], 
      ...appointmentData,
      updatedDate: new Date()
    };
    
    const updatedAppointments = [...currentAppointments];
    updatedAppointments[appointmentIndex] = updatedAppointment;
    
    this.appointmentsSubject.next(updatedAppointments);
    return updatedAppointment;
  }

  deleteAppointment(id: string): boolean {
    const currentAppointments = this.appointmentsSubject.value;
    const filteredAppointments = currentAppointments.filter(appointment => appointment.id !== id);
    
    if (filteredAppointments.length !== currentAppointments.length) {
      this.appointmentsSubject.next(filteredAppointments);
      return true;
    }
    
    return false;
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

  confirmAppointment(id: string): boolean {
    const appointment = this.updateAppointment(id, { 
      status: AppointmentStatus.CONFIRMED 
    });
    return appointment !== null;
  }

  cancelAppointment(id: string): boolean {
    const appointment = this.updateAppointment(id, { 
      status: AppointmentStatus.CANCELLED 
    });
    return appointment !== null;
  }

  markAsCompleted(id: string): boolean {
    const appointment = this.updateAppointment(id, { 
      status: AppointmentStatus.COMPLETED 
    });
    return appointment !== null;
  }

  rescheduleAppointment(id: string, newDate: Date, newTime: string): boolean {
    const appointment = this.updateAppointment(id, {
      appointmentDate: newDate,
      startTime: newTime,
      endTime: this.calculateEndTime(newTime, this.getAppointmentById(id)?.duration || 30),
      status: AppointmentStatus.RESCHEDULED
    });
    return appointment !== null;
  }

  sendReminder(id: string): boolean {
    const appointment = this.updateAppointment(id, {
      reminder: {
        sent: true,
        sentDate: new Date()
      }
    });
    return appointment !== null;
  }

  private generateId(): string {
    return 'appointment_' + Math.random().toString(36).substr(2, 9);
  }

  private getPatientNameById(patientId: string): string {
    // In a real app, this would fetch from the patient service
    const mockPatients: { [key: string]: string } = {
      'patient_001': 'John Doe',
      'patient_002': 'Sarah Wilson',
      'patient_003': 'Mike Johnson'
    };
    return mockPatients[patientId] || 'Unknown Patient';
  }

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

  private getMockAppointments(): Appointment[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return [
      {
        id: 'appointment_001',
        patientId: 'patient_001',
        patientName: 'John Doe',
        doctorName: 'Dr. Smith',
        appointmentDate: today,
        startTime: '09:00',
        endTime: '09:30',
        type: AppointmentType.CLEANING,
        status: AppointmentStatus.CONFIRMED,
        duration: 30,
        notes: 'Regular cleaning appointment',
        createdDate: new Date('2024-01-10'),
        updatedDate: new Date('2024-01-10'),
        reminder: { sent: true, sentDate: new Date() }
      },
      {
        id: 'appointment_002',
        patientId: 'patient_002',
        patientName: 'Sarah Wilson',
        doctorName: 'Dr. Smith',
        appointmentDate: today,
        startTime: '10:30',
        endTime: '11:30',
        type: AppointmentType.EXTRACTION,
        status: AppointmentStatus.CONFIRMED,
        duration: 60,
        notes: 'Wisdom tooth extraction',
        createdDate: new Date('2024-01-08'),
        updatedDate: new Date('2024-01-08'),
        reminder: { sent: false }
      },
      {
        id: 'appointment_003',
        patientId: 'patient_003',
        patientName: 'Mike Johnson',
        doctorName: 'Dr. Smith',
        appointmentDate: today,
        startTime: '14:00',
        endTime: '15:00',
        type: AppointmentType.ROOT_CANAL,
        status: AppointmentStatus.SCHEDULED,
        duration: 60,
        notes: 'Root canal treatment - session 2',
        createdDate: new Date('2024-01-15'),
        updatedDate: new Date('2024-01-15'),
        reminder: { sent: false }
      },
      {
        id: 'appointment_004',
        patientId: 'patient_001',
        patientName: 'John Doe',
        doctorName: 'Dr. Smith',
        appointmentDate: tomorrow,
        startTime: '11:00',
        endTime: '11:30',
        type: AppointmentType.FOLLOW_UP,
        status: AppointmentStatus.SCHEDULED,
        duration: 30,
        notes: 'Follow-up after cleaning',
        createdDate: new Date('2024-01-12'),
        updatedDate: new Date('2024-01-12'),
        reminder: { sent: false }
      },
      {
        id: 'appointment_005',
        patientId: 'patient_002',
        patientName: 'Sarah Wilson',
        doctorName: 'Dr. Smith',
        appointmentDate: nextWeek,
        startTime: '15:30',
        endTime: '16:30',
        type: AppointmentType.CROWN,
        status: AppointmentStatus.SCHEDULED,
        duration: 60,
        notes: 'Crown placement',
        createdDate: new Date('2024-01-16'),
        updatedDate: new Date('2024-01-16'),
        reminder: { sent: false }
      }
    ];
  }
}
