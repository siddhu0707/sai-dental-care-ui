package com.sai.dental.repository;

import com.sai.dental.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    
    Optional<Patient> findByEmail(String email);
    
    Optional<Patient> findByPhone(String phone);
    
    @Query("SELECT p FROM Patient p WHERE LOWER(p.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Patient> searchPatients(String searchTerm);
    
    @Query("SELECT p FROM Patient p ORDER BY p.registrationDate DESC")
    List<Patient> findAllOrderByRegistrationDateDesc();
}
