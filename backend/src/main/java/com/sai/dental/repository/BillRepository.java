package com.sai.dental.repository;

import com.sai.dental.entity.Bill;
import com.sai.dental.entity.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    
    List<Bill> findByPatientId(Long patientId);
    
    List<Bill> findByStatus(BillStatus status);
    
    Optional<Bill> findByBillNumber(String billNumber);
    
    List<Bill> findByAppointmentId(Long appointmentId);
    
    @Query("SELECT b FROM Bill b WHERE b.dueDate < :currentDate AND b.status IN ('SENT', 'PARTIAL')")
    List<Bill> findOverdueBills(LocalDate currentDate);
    
    @Query("SELECT b FROM Bill b WHERE b.issueDate BETWEEN :startDate AND :endDate ORDER BY b.issueDate DESC")
    List<Bill> findBillsByDateRange(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT COUNT(b) FROM Bill b WHERE DATE(b.issueDate) = DATE(:date)")
    Long countBillsForDate(LocalDate date);
}
