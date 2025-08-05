export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  medicalHistory: string[];
  allergies: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  registrationDate: Date;
  lastVisit?: Date;
  nextAppointment?: Date;
  totalVisits: number;
  notes: string;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  medicalHistory: string[];
  allergies: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes: string;
}
