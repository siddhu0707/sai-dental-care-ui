export interface PatientBalance {
  patientId: string;
  patientName: string;
  totalBilled: number;
  totalPaid: number;
  remainingBalance: number;
  lastPaymentDate?: Date;
  lastBillDate?: Date;
  paymentHistory: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  billId: string;
  amount: number;
  date: Date;
  method: string;
  appointmentId?: string;
  notes?: string;
}

export interface PatientPaymentSummary {
  patientId: string;
  patientName: string;
  totalOutstanding: number;
  overdueAmount: number;
  lastVisitDate?: Date;
  nextAppointmentDate?: Date;
}
