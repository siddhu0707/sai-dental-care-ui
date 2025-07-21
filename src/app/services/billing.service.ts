import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Bill, CreateBillRequest, BillStatus, Payment, PaymentMethod, ServiceTemplate, ServiceCategory, BillItem } from '../models/billing.model';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private billsSubject = new BehaviorSubject<Bill[]>(this.getMockBills());
  public bills$ = this.billsSubject.asObservable();

  private paymentsSubject = new BehaviorSubject<Payment[]>(this.getMockPayments());
  public payments$ = this.paymentsSubject.asObservable();

  private serviceTemplatesSubject = new BehaviorSubject<ServiceTemplate[]>(this.getMockServiceTemplates());
  public serviceTemplates$ = this.serviceTemplatesSubject.asObservable();

  private readonly TAX_RATE = 0.08; // 8% tax rate

  constructor() {}

  getBills(): Observable<Bill[]> {
    return this.bills$;
  }

  getBillById(id: string): Bill | undefined {
    return this.billsSubject.value.find(bill => bill.id === id);
  }

  getBillsByPatient(patientId: string): Bill[] {
    return this.billsSubject.value.filter(bill => bill.patientId === patientId);
  }

  getPendingBills(): Bill[] {
    return this.billsSubject.value.filter(bill => 
      bill.status === BillStatus.SENT || bill.status === BillStatus.OVERDUE
    );
  }

  getOverdueBills(): Bill[] {
    const today = new Date();
    return this.billsSubject.value.filter(bill => 
      (bill.status === BillStatus.SENT || bill.status === BillStatus.OVERDUE) && 
      bill.dueDate < today
    );
  }

  createBill(billData: CreateBillRequest): Bill {
    const subtotal = this.calculateSubtotal(billData.items);
    const tax = subtotal * this.TAX_RATE;
    const total = subtotal + tax - billData.discount;

    const newBill: Bill = {
      id: this.generateId(),
      ...billData,
      patientName: this.getPatientNameById(billData.patientId),
      billNumber: this.generateBillNumber(),
      issueDate: new Date(),
      dueDate: this.calculateDueDate(),
      items: billData.items.map(item => ({
        ...item,
        id: this.generateId(),
        total: item.quantity * item.unitPrice
      })),
      subtotal,
      tax,
      total,
      status: BillStatus.DRAFT,
      createdDate: new Date(),
      updatedDate: new Date()
    };

    const currentBills = this.billsSubject.value;
    this.billsSubject.next([...currentBills, newBill]);
    
    return newBill;
  }

  updateBill(id: string, billData: Partial<Bill>): Bill | null {
    const currentBills = this.billsSubject.value;
    const billIndex = currentBills.findIndex(bill => bill.id === id);
    
    if (billIndex === -1) {
      return null;
    }

    const updatedBill = { 
      ...currentBills[billIndex], 
      ...billData,
      updatedDate: new Date()
    };
    
    // Recalculate totals if items changed
    if (billData.items) {
      updatedBill.subtotal = this.calculateSubtotal(billData.items);
      updatedBill.tax = updatedBill.subtotal * this.TAX_RATE;
      updatedBill.total = updatedBill.subtotal + updatedBill.tax - (billData.discount || 0);
    }
    
    const updatedBills = [...currentBills];
    updatedBills[billIndex] = updatedBill;
    
    this.billsSubject.next(updatedBills);
    return updatedBill;
  }

  deleteBill(id: string): boolean {
    const currentBills = this.billsSubject.value;
    const filteredBills = currentBills.filter(bill => bill.id !== id);
    
    if (filteredBills.length !== currentBills.length) {
      this.billsSubject.next(filteredBills);
      return true;
    }
    
    return false;
  }

  sendBill(id: string): boolean {
    const bill = this.updateBill(id, { status: BillStatus.SENT });
    return bill !== null;
  }

  markAsPaid(id: string, paymentMethod: PaymentMethod, paymentAmount?: number): boolean {
    const bill = this.getBillById(id);
    if (!bill) return false;

    const amountPaid = paymentAmount || bill.total;
    const status = amountPaid >= bill.total ? BillStatus.PAID : BillStatus.PARTIAL;

    // Create payment record
    const payment: Payment = {
      id: this.generateId(),
      billId: id,
      amount: amountPaid,
      method: paymentMethod,
      date: new Date(),
      reference: this.generatePaymentReference(),
      notes: ''
    };

    // Add payment to payments list
    const currentPayments = this.paymentsSubject.value;
    this.paymentsSubject.next([...currentPayments, payment]);

    // Update bill status
    const updatedBill = this.updateBill(id, {
      status,
      paymentMethod,
      paymentDate: new Date()
    });

    return updatedBill !== null;
  }

  cancelBill(id: string): boolean {
    const bill = this.updateBill(id, { status: BillStatus.CANCELLED });
    return bill !== null;
  }

  getPaymentsByBill(billId: string): Payment[] {
    return this.paymentsSubject.value.filter(payment => payment.billId === billId);
  }

  getTotalPayments(billId: string): number {
    return this.getPaymentsByBill(billId).reduce((total, payment) => total + payment.amount, 0);
  }

  getServiceTemplates(): Observable<ServiceTemplate[]> {
    return this.serviceTemplates$;
  }

  addServiceTemplate(template: Omit<ServiceTemplate, 'id'>): ServiceTemplate {
    const newTemplate: ServiceTemplate = {
      ...template,
      id: this.generateId()
    };

    const currentTemplates = this.serviceTemplatesSubject.value;
    this.serviceTemplatesSubject.next([...currentTemplates, newTemplate]);
    
    return newTemplate;
  }

  // Reporting methods
  getMonthlyRevenue(year: number, month: number): number {
    const paidBills = this.billsSubject.value.filter(bill => 
      bill.status === BillStatus.PAID &&
      bill.paymentDate &&
      bill.paymentDate.getFullYear() === year &&
      bill.paymentDate.getMonth() === month
    );

    return paidBills.reduce((total, bill) => total + bill.total, 0);
  }

  getRevenueByPeriod(startDate: Date, endDate: Date): number {
    const paidBills = this.billsSubject.value.filter(bill => 
      bill.status === BillStatus.PAID &&
      bill.paymentDate &&
      bill.paymentDate >= startDate &&
      bill.paymentDate <= endDate
    );

    return paidBills.reduce((total, bill) => total + bill.total, 0);
  }

  getOutstandingAmount(): number {
    const unpaidBills = this.billsSubject.value.filter(bill => 
      bill.status === BillStatus.SENT || bill.status === BillStatus.OVERDUE || bill.status === BillStatus.PARTIAL
    );

    return unpaidBills.reduce((total, bill) => {
      const paid = this.getTotalPayments(bill.id);
      return total + (bill.total - paid);
    }, 0);
  }

  private calculateSubtotal(items: Omit<BillItem, 'id' | 'total'>[]): number {
    return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  }

  private calculateDueDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 days from issue date
    return date;
  }

  private generateId(): string {
    return 'bill_' + Math.random().toString(36).substr(2, 9);
  }

  private generateBillNumber(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  }

  private generatePaymentReference(): string {
    return 'PAY-' + Math.random().toString(36).substr(2, 9).toUpperCase();
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

  private getMockBills(): Bill[] {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);

    return [
      {
        id: 'bill_001',
        patientId: 'patient_001',
        patientName: 'John Doe',
        appointmentId: 'appointment_001',
        billNumber: 'INV-202401-001',
        issueDate: lastWeek,
        dueDate: new Date(lastWeek.getTime() + 30 * 24 * 60 * 60 * 1000),
        items: [
          {
            id: 'item_001',
            description: 'Routine Dental Cleaning',
            category: ServiceCategory.CLEANING,
            quantity: 1,
            unitPrice: 120,
            total: 120
          },
          {
            id: 'item_002',
            description: 'Fluoride Treatment',
            category: ServiceCategory.CLEANING,
            quantity: 1,
            unitPrice: 30,
            total: 30
          }
        ],
        subtotal: 150,
        tax: 12,
        discount: 0,
        total: 162,
        status: BillStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        paymentDate: today,
        notes: 'Regular cleaning appointment',
        createdDate: lastWeek,
        updatedDate: today
      },
      {
        id: 'bill_002',
        patientId: 'patient_002',
        patientName: 'Sarah Wilson',
        appointmentId: 'appointment_002',
        billNumber: 'INV-202401-002',
        issueDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000),
        items: [
          {
            id: 'item_003',
            description: 'Tooth Extraction',
            category: ServiceCategory.EXTRACTION,
            quantity: 1,
            unitPrice: 250,
            total: 250
          },
          {
            id: 'item_004',
            description: 'Post-extraction Care Kit',
            category: ServiceCategory.MEDICATION,
            quantity: 1,
            unitPrice: 25,
            total: 25
          }
        ],
        subtotal: 275,
        tax: 22,
        discount: 0,
        total: 297,
        status: BillStatus.SENT,
        notes: 'Wisdom tooth extraction',
        createdDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        updatedDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'bill_003',
        patientId: 'patient_003',
        patientName: 'Mike Johnson',
        appointmentId: 'appointment_003',
        billNumber: 'INV-202401-003',
        issueDate: lastMonth,
        dueDate: new Date(lastMonth.getTime() + 30 * 24 * 60 * 60 * 1000),
        items: [
          {
            id: 'item_005',
            description: 'Root Canal Treatment',
            category: ServiceCategory.ROOT_CANAL,
            quantity: 1,
            unitPrice: 800,
            total: 800
          }
        ],
        subtotal: 800,
        tax: 64,
        discount: 50,
        total: 814,
        status: BillStatus.OVERDUE,
        notes: 'Root canal treatment - session 1',
        createdDate: lastMonth,
        updatedDate: lastMonth
      }
    ];
  }

  private getMockPayments(): Payment[] {
    return [
      {
        id: 'payment_001',
        billId: 'bill_001',
        amount: 162,
        method: PaymentMethod.CREDIT_CARD,
        date: new Date(),
        reference: 'PAY-CC123456',
        notes: 'Paid in full'
      }
    ];
  }

  private getMockServiceTemplates(): ServiceTemplate[] {
    return [
      {
        id: 'template_001',
        name: 'Routine Cleaning',
        category: ServiceCategory.CLEANING,
        defaultPrice: 120,
        description: 'Standard dental cleaning and examination'
      },
      {
        id: 'template_002',
        name: 'Tooth Extraction',
        category: ServiceCategory.EXTRACTION,
        defaultPrice: 250,
        description: 'Simple tooth extraction procedure'
      },
      {
        id: 'template_003',
        name: 'Root Canal',
        category: ServiceCategory.ROOT_CANAL,
        defaultPrice: 800,
        description: 'Root canal treatment procedure'
      },
      {
        id: 'template_004',
        name: 'Dental Filling',
        category: ServiceCategory.FILLING,
        defaultPrice: 180,
        description: 'Composite dental filling'
      },
      {
        id: 'template_005',
        name: 'Crown Placement',
        category: ServiceCategory.CROWN,
        defaultPrice: 1200,
        description: 'Porcelain crown placement'
      }
    ];
  }
}
