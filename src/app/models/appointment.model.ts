export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  status: AppointmentStatus;
  duration: number; // in minutes
  notes: string;
  createdDate: Date;
  updatedDate: Date;
  reminder?: {
    sent: boolean;
    sentDate?: Date;
  };
}

export enum AppointmentType {
  CONSULTATION = 'CONSULTATION',
  CLEANING = 'CLEANING',
  FILLING = 'FILLING',
  EXTRACTION = 'EXTRACTION',
  ROOT_CANAL = 'ROOT_CANAL',
  CROWN = 'CROWN',
  IMPLANT = 'IMPLANT',
  ORTHODONTICS = 'ORTHODONTICS',
  EMERGENCY = 'EMERGENCY',
  FOLLOW_UP = 'FOLLOW_UP'
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED'
}

export interface CreateAppointmentRequest {
  patientId: string;
  patientName: string;
  appointmentDate: Date;
  startTime: string;
  type: AppointmentType;
  duration: number;
  notes: string;
  doctorName: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

export interface DaySchedule {
  date: Date;
  timeSlots: TimeSlot[];
}
