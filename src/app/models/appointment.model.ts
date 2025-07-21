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
  CONSULTATION = 'Consultation',
  CLEANING = 'Routine Cleaning',
  FILLING = 'Dental Filling',
  EXTRACTION = 'Tooth Extraction',
  ROOT_CANAL = 'Root Canal',
  CROWN = 'Crown Placement',
  IMPLANT = 'Dental Implant',
  ORTHODONTICS = 'Orthodontic Treatment',
  EMERGENCY = 'Emergency Visit',
  FOLLOW_UP = 'Follow-up Visit'
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no-show',
  RESCHEDULED = 'rescheduled'
}

export interface CreateAppointmentRequest {
  patientId: string;
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
