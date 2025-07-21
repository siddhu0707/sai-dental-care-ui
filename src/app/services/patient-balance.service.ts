import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { PatientBalance, PaymentRecord, PatientPaymentSummary } from '../models/patient-balance.model';
import { BillingService } from './billing.service';
import { PatientService } from './patient.service';

@Injectable({
  providedIn: 'root'
})
export class PatientBalanceService {
  private patientBalancesSubject = new BehaviorSubject<PatientBalance[]>([]);
  public patientBalances$ = this.patientBalancesSubject.asObservable();

  constructor(
    private billingService: BillingService,
    private patientService: PatientService
  ) {
    this.initializeBalances();
  }

  private initializeBalances() {
    // Combine bills, payments, and patients to calculate balances
    combineLatest([
      this.billingService.getBills(),
      this.billingService.payments$,
      this.patientService.getPatients()
    ]).pipe(
      map(([bills, payments, patients]) => {
        const balances: PatientBalance[] = [];
        
        patients.forEach(patient => {
          const patientBills = bills.filter(bill => bill.patientId === patient.id);
          const patientPayments = payments.filter(payment => 
            patientBills.some(bill => bill.id === payment.billId)
          );
          
          const totalBilled = patientBills.reduce((sum, bill) => sum + bill.total, 0);
          const totalPaid = patientPayments.reduce((sum, payment) => sum + payment.amount, 0);
          
          const paymentHistory: PaymentRecord[] = patientPayments.map(payment => ({
            id: payment.id,
            billId: payment.billId,
            amount: payment.amount,
            date: payment.date,
            method: payment.method,
            notes: payment.notes
          }));

          const lastPayment = patientPayments
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          
          const lastBill = patientBills
            .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())[0];

          balances.push({
            patientId: patient.id,
            patientName: `${patient.firstName} ${patient.lastName}`,
            totalBilled,
            totalPaid,
            remainingBalance: totalBilled - totalPaid,
            lastPaymentDate: lastPayment?.date,
            lastBillDate: lastBill?.issueDate,
            paymentHistory
          });
        });

        return balances;
      })
    ).subscribe(balances => {
      this.patientBalancesSubject.next(balances);
    });
  }

  getPatientBalance(patientId: string): Observable<PatientBalance | undefined> {
    return this.patientBalances$.pipe(
      map(balances => balances.find(balance => balance.patientId === patientId))
    );
  }

  getPatientsWithOutstandingBalance(): Observable<PatientBalance[]> {
    return this.patientBalances$.pipe(
      map(balances => balances.filter(balance => balance.remainingBalance > 0))
    );
  }

  getPatientPaymentSummaries(): Observable<PatientPaymentSummary[]> {
    return combineLatest([
      this.patientBalances$,
      this.billingService.getBills()
    ]).pipe(
      map(([balances, bills]) => {
        return balances.map(balance => {
          const patientBills = bills.filter(bill => bill.patientId === balance.patientId);
          const overdueBills = patientBills.filter(bill => 
            (bill.status === 'sent' || bill.status === 'overdue') && 
            new Date(bill.dueDate) < new Date()
          );
          
          const overdueAmount = overdueBills.reduce((sum, bill) => {
            const paidAmount = this.billingService.getTotalPayments(bill.id);
            return sum + (bill.total - paidAmount);
          }, 0);

          return {
            patientId: balance.patientId,
            patientName: balance.patientName,
            totalOutstanding: balance.remainingBalance,
            overdueAmount,
            lastVisitDate: balance.lastBillDate,
            nextAppointmentDate: undefined // This would come from appointment service
          };
        }).filter(summary => summary.totalOutstanding > 0);
      })
    );
  }

  getTotalOutstandingAmount(): Observable<number> {
    return this.patientBalances$.pipe(
      map(balances => balances.reduce((total, balance) => total + balance.remainingBalance, 0))
    );
  }

  getTopDebtors(limit: number = 5): Observable<PatientBalance[]> {
    return this.patientBalances$.pipe(
      map(balances => 
        balances
          .filter(balance => balance.remainingBalance > 0)
          .sort((a, b) => b.remainingBalance - a.remainingBalance)
          .slice(0, limit)
      )
    );
  }
}
