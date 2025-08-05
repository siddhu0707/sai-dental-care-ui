package com.sai.dental.service;

import com.sai.dental.entity.Patient;
import com.sai.dental.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    public List<Patient> getAllPatients() {
        return patientRepository.findAllOrderByRegistrationDateDesc();
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    public Patient savePatient(Patient patient) {
        if (patient.getId() == null) {
            patient.setRegistrationDate(LocalDateTime.now());
        }
        return patientRepository.save(patient);
    }

    public Patient updatePatient(Long id, Patient patientDetails) {
        return patientRepository.findById(id)
                .map(patient -> {
                    patient.setFirstName(patientDetails.getFirstName());
                    patient.setLastName(patientDetails.getLastName());
                    patient.setEmail(patientDetails.getEmail());
                    patient.setPhone(patientDetails.getPhone());
                    patient.setDateOfBirth(patientDetails.getDateOfBirth());
                    patient.setGender(patientDetails.getGender());
                    patient.setAddress(patientDetails.getAddress());
                    patient.setMedicalHistory(patientDetails.getMedicalHistory());
                    patient.setAllergies(patientDetails.getAllergies());
                    patient.setEmergencyContact(patientDetails.getEmergencyContact());
                    patient.setNotes(patientDetails.getNotes());
                    if (patientDetails.getLastVisit() != null) {
                        patient.setLastVisit(patientDetails.getLastVisit());
                    }
                    if (patientDetails.getNextAppointment() != null) {
                        patient.setNextAppointment(patientDetails.getNextAppointment());
                    }
                    if (patientDetails.getTotalVisits() != null) {
                        patient.setTotalVisits(patientDetails.getTotalVisits());
                    }
                    return patientRepository.save(patient);
                })
                .orElseThrow(() -> new RuntimeException("Patient not found with id " + id));
    }

    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }

    public List<Patient> searchPatients(String searchTerm) {
        return patientRepository.searchPatients(searchTerm);
    }

    public Optional<Patient> findByEmail(String email) {
        return patientRepository.findByEmail(email);
    }

    public Optional<Patient> findByPhone(String phone) {
        return patientRepository.findByPhone(phone);
    }
}
