package com.sai.dental.repository;

import com.sai.dental.entity.Appointment;
import com.sai.dental.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByPatientId(Long patientId);
    
    List<Appointment> findByAppointmentDate(LocalDate appointmentDate);
    
    List<Appointment> findByAppointmentDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Appointment> findByStatus(AppointmentStatus status);
    
    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate = :date " +
           "AND a.startTime = :startTime AND a.status != 'CANCELLED'")
    List<Appointment> findConflictingAppointments(LocalDate date, String startTime);
    
    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate >= :startDate " +
           "AND a.appointmentDate <= :endDate ORDER BY a.appointmentDate, a.startTime")
    List<Appointment> findAppointmentsInDateRange(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT a FROM Appointment a WHERE a.reminder.sent = false " +
           "AND a.appointmentDate = :tomorrow AND a.status IN ('SCHEDULED', 'CONFIRMED')")
    List<Appointment> findAppointmentsForReminder(LocalDate tomorrow);
}
