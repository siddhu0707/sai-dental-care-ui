package com.sai.dental.service;

import com.sai.dental.entity.Bill;
import com.sai.dental.entity.BillItem;
import com.sai.dental.entity.BillStatus;
import com.sai.dental.entity.PaymentMethod;
import com.sai.dental.repository.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class BillService {

    @Autowired
    private BillRepository billRepository;

    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    public Optional<Bill> getBillById(Long id) {
        return billRepository.findById(id);
    }

    public Bill saveBill(Bill bill) {
        if (bill.getBillNumber() == null || bill.getBillNumber().isEmpty()) {
            bill.setBillNumber(generateBillNumber());
        }
        
        // Calculate totals
        calculateBillTotals(bill);
        
        // Set bill reference for all items
        for (BillItem item : bill.getItems()) {
            item.setBill(bill);
        }
        
        return billRepository.save(bill);
    }

    public Bill updateBill(Long id, Bill billDetails) {
        return billRepository.findById(id)
                .map(bill -> {
                    bill.setPatientId(billDetails.getPatientId());
                    bill.setPatientName(billDetails.getPatientName());
                    bill.setAppointmentId(billDetails.getAppointmentId());
                    bill.setIssueDate(billDetails.getIssueDate());
                    bill.setDueDate(billDetails.getDueDate());
                    
                    // Clear existing items and add new ones
                    bill.getItems().clear();
                    for (BillItem item : billDetails.getItems()) {
                        bill.addItem(item);
                    }
                    
                    bill.setDiscount(billDetails.getDiscount());
                    bill.setStatus(billDetails.getStatus());
                    bill.setPaymentMethod(billDetails.getPaymentMethod());
                    bill.setPaymentDate(billDetails.getPaymentDate());
                    bill.setNotes(billDetails.getNotes());
                    
                    // Recalculate totals
                    calculateBillTotals(bill);
                    
                    return billRepository.save(bill);
                })
                .orElseThrow(() -> new RuntimeException("Bill not found with id " + id));
    }

    public void deleteBill(Long id) {
        billRepository.deleteById(id);
    }

    public List<Bill> getBillsByPatientId(Long patientId) {
        return billRepository.findByPatientId(patientId);
    }

    public List<Bill> getBillsByStatus(BillStatus status) {
        return billRepository.findByStatus(status);
    }

    public List<Bill> getOverdueBills() {
        return billRepository.findOverdueBills(LocalDate.now());
    }

    public List<Bill> getBillsByDateRange(LocalDate startDate, LocalDate endDate) {
        return billRepository.findBillsByDateRange(startDate, endDate);
    }

    public Bill markAsPaid(Long billId, PaymentMethod paymentMethod) {
        return billRepository.findById(billId)
                .map(bill -> {
                    bill.setStatus(BillStatus.PAID);
                    bill.setPaymentMethod(paymentMethod);
                    bill.setPaymentDate(LocalDateTime.now());
                    return billRepository.save(bill);
                })
                .orElseThrow(() -> new RuntimeException("Bill not found with id " + billId));
    }

    private void calculateBillTotals(Bill bill) {
        BigDecimal subtotal = bill.getItems().stream()
                .map(BillItem::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        bill.setSubtotal(subtotal);
        
        // Calculate tax (18% GST)
        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.18));
        bill.setTax(tax);
        
        // Calculate total
        BigDecimal total = subtotal.add(tax).subtract(bill.getDiscount());
        bill.setTotal(total);
    }

    private String generateBillNumber() {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        Long count = billRepository.countBillsForDate(LocalDate.now());
        return String.format("INV-%s-%03d", datePrefix, count + 1);
    }
}
