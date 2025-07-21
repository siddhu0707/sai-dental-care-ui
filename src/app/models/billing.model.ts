export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  billNumber: string;
  issueDate: Date;
  dueDate: Date;
  items: BillItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: BillStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: Date;
  notes: string;
  createdDate: Date;
  updatedDate: Date;
}

export interface BillItem {
  id: string;
  description: string;
  category: ServiceCategory;
  quantity: number;
  unitPrice: number;
  total: number;
}

export enum BillStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  PARTIAL = 'partial'
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CHECK = 'check',
  INSURANCE = 'insurance',
  BANK_TRANSFER = 'bank_transfer'
}

export enum ServiceCategory {
  CONSULTATION = 'consultation',
  CLEANING = 'cleaning',
  FILLING = 'filling',
  EXTRACTION = 'extraction',
  ROOT_CANAL = 'root_canal',
  CROWN = 'crown',
  IMPLANT = 'implant',
  ORTHODONTICS = 'orthodontics',
  COSMETIC = 'cosmetic',
  EMERGENCY = 'emergency',
  MEDICATION = 'medication',
  OTHER = 'other'
}

export interface CreateBillRequest {
  patientId: string;
  appointmentId?: string;
  items: Omit<BillItem, 'id' | 'total'>[];
  discount: number;
  notes: string;
}

export interface Payment {
  id: string;
  billId: string;
  amount: number;
  method: PaymentMethod;
  date: Date;
  reference: string;
  notes: string;
}

export interface ServiceTemplate {
  id: string;
  name: string;
  category: ServiceCategory;
  defaultPrice: number;
  description: string;
}
