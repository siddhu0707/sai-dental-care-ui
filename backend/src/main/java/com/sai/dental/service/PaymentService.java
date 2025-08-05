package com.sai.dental.service;

import com.sai.dental.entity.Payment;
import com.sai.dental.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    public Payment savePayment(Payment payment) {
        if (payment.getReference() == null || payment.getReference().isEmpty()) {
            payment.setReference(generatePaymentReference());
        }
        if (payment.getDate() == null) {
            payment.setDate(LocalDateTime.now());
        }
        return paymentRepository.save(payment);
    }

    public void deletePayment(Long id) {
        paymentRepository.deleteById(id);
    }

    public List<Payment> getPaymentsByBillId(Long billId) {
        return paymentRepository.findByBillId(billId);
    }

    public List<Payment> getPaymentsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return paymentRepository.findPaymentsByDateRange(startDate, endDate);
    }

    public Double getTotalPaymentsForDate(LocalDateTime date) {
        return paymentRepository.getTotalPaymentsForDate(date);
    }

    private String generatePaymentReference() {
        String prefix = "PAY-";
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder reference = new StringBuilder(prefix);
        
        for (int i = 0; i < 9; i++) {
            reference.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return reference.toString();
    }
}
