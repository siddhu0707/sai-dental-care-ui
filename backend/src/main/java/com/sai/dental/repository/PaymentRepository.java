package com.sai.dental.repository;

import com.sai.dental.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    List<Payment> findByBillId(Long billId);
    
    @Query("SELECT p FROM Payment p WHERE p.date BETWEEN :startDate AND :endDate ORDER BY p.date DESC")
    List<Payment> findPaymentsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE DATE(p.date) = DATE(:date)")
    Double getTotalPaymentsForDate(LocalDateTime date);
}
