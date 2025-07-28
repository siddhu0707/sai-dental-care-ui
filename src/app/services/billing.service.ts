import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Bill, CreateBillRequest, BillStatus, Payment, PaymentMethod, ServiceTemplate, ServiceCategory, BillItem } from '../models/billing.model';
import { ApiService } from './api.service';

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

  constructor(private apiService: ApiService) {
    this.loadBills();
    this.loadPayments();
    this.loadServiceTemplates();
  }

  private loadBills() {
    this.apiService.getBills().pipe(
      catchError(error => {
        console.error('Error loading bills:', error);
        return of(this.getMockBills());
      })
    ).subscribe(bills => {
      try {
        const processedBills = bills.map(bill => ({
          ...bill,
          issueDate: new Date(bill.issueDate),
          dueDate: new Date(bill.dueDate),
          paymentDate: bill.paymentDate ? new Date(bill.paymentDate) : undefined,
          createdDate: new Date(bill.createdDate),
          updatedDate: new Date(bill.updatedDate)
        }));
        this.billsSubject.next(processedBills);
      } catch (error) {
        console.error('Error processing bills data:', error);
        this.billsSubject.next(this.getMockBills());
      }
    });
  }

  private loadPayments() {
    this.apiService.getPayments().pipe(
      catchError(error => {
        console.error('Error loading payments:', error);
        return of(this.getMockPayments());
      })
    ).subscribe(payments => {
      try {
        const processedPayments = payments.map(payment => ({
          ...payment,
          date: new Date(payment.date)
        }));
        this.paymentsSubject.next(processedPayments);
      } catch (error) {
        console.error('Error processing payments data:', error);
        this.paymentsSubject.next(this.getMockPayments());
      }
    });
  }

  private loadServiceTemplates() {
    this.apiService.getServiceTemplates().pipe(
      catchError(error => {
        console.error('Error loading service templates:', error);
        return of(this.getMockServiceTemplates());
      })
    ).subscribe(templates => {
      this.serviceTemplatesSubject.next(templates);
    });
  }

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

  createBill(billData: CreateBillRequest): Observable<Bill> {
    const subtotal = this.calculateSubtotal(billData.items);
    const tax = subtotal * this.TAX_RATE;
    const total = subtotal + tax - billData.discount;

    const newBill: any = {
      ...billData,
      patientName: this.getPatientNameById(billData.patientId),
      billNumber: this.generateBillNumber(),
      issueDate: new Date().toISOString(),
      dueDate: this.calculateDueDate().toISOString(),
      items: billData.items.map(item => ({
        ...item,
        id: this.generateId(),
        total: item.quantity * item.unitPrice
      })),
      subtotal,
      tax,
      total,
      status: BillStatus.DRAFT,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    return this.apiService.createBill(newBill).pipe(
      tap(() => this.loadBills()),
      catchError(error => {
        console.error('Error creating bill:', error);
        // Fallback to local creation if API fails
        const localBill: Bill = {
          ...newBill,
          id: this.generateId(),
          issueDate: new Date(),
          dueDate: this.calculateDueDate(),
          paymentDate: undefined,
          createdDate: new Date(),
          updatedDate: new Date()
        };
        const currentBills = this.billsSubject.value;
        this.billsSubject.next([...currentBills, localBill]);
        return of(localBill);
      })
    );
  }

  updateBill(id: string, billData: Partial<Bill>): Observable<Bill> {
    return this.apiService.updateBill(id, billData).pipe(
      tap(() => this.loadBills()),
      catchError(error => {
        console.error('Error updating bill:', error);
        // Fallback to local update if API fails
        const currentBills = this.billsSubject.value;
        const billIndex = currentBills.findIndex(bill => bill.id === id);

        if (billIndex === -1) {
          throw error;
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
        return of(updatedBill);
      })
    );
  }

  deleteBill(id: string): Observable<void> {
    return this.apiService.deleteBill(id).pipe(
      tap(() => this.loadBills()),
      catchError(error => {
        console.error('Error deleting bill:', error);
        // Fallback to local deletion if API fails
        const currentBills = this.billsSubject.value;
        const filteredBills = currentBills.filter(bill => bill.id !== id);

        if (filteredBills.length !== currentBills.length) {
          this.billsSubject.next(filteredBills);
        }

        return of(void 0);
      })
    );
  }

  sendBill(id: string): Observable<boolean> {
    return this.updateBill(id, { status: BillStatus.SENT }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  markAsPaid(id: string, paymentMethod: PaymentMethod, paymentAmount?: number): Observable<boolean> {
    const bill = this.getBillById(id);
    if (!bill) return of(false);

    const amountPaid = paymentAmount || bill.total;
    const status = amountPaid >= bill.total ? BillStatus.PAID : BillStatus.PARTIAL;

    // Create payment record
    const payment: any = {
      billId: id,
      amount: amountPaid,
      method: paymentMethod,
      date: new Date().toISOString(),
      reference: this.generatePaymentReference(),
      notes: ''
    };

    // Create payment via API
    return this.apiService.createPayment(payment).pipe(
      tap(() => this.loadPayments()),
      catchError(() => {
        // Fallback to local creation if API fails
        const localPayment = {
          ...payment,
          id: this.generateId(),
          date: new Date()
        };
        const currentPayments = this.paymentsSubject.value;
        this.paymentsSubject.next([...currentPayments, localPayment]);
        return of(localPayment);
      }),
      tap(() => {
        // Update bill status
        this.updateBill(id, {
          status,
          paymentMethod,
          paymentDate: new Date()
        }).subscribe();
      }),
      tap(() => true),
      catchError(() => of(false))
    );
  }

  cancelBill(id: string): Observable<boolean> {
    return this.updateBill(id, { status: BillStatus.CANCELLED }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
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

  addServiceTemplate(template: Omit<ServiceTemplate, 'id'>): Observable<ServiceTemplate> {
    return this.apiService.createServiceTemplate(template).pipe(
      tap(() => this.loadServiceTemplates()),
      catchError(error => {
        console.error('Error creating service template:', error);
        // Fallback to local creation if API fails
        const newTemplate: ServiceTemplate = {
          ...template,
          id: this.generateId()
        };

        const currentTemplates = this.serviceTemplatesSubject.value;
        this.serviceTemplatesSubject.next([...currentTemplates, newTemplate]);

        return of(newTemplate);
      })
    );
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
