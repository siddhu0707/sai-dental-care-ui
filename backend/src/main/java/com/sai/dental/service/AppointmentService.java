package com.sai.dental.service;

import com.sai.dental.entity.Appointment;
import com.sai.dental.entity.AppointmentStatus;
import com.sai.dental.entity.Reminder;
import com.sai.dental.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }

    public Appointment saveAppointment(Appointment appointment) {
        if (appointment.getReminder() == null) {
            appointment.setReminder(new Reminder());
        }
        return appointmentRepository.save(appointment);
    }

    public Appointment updateAppointment(Long id, Appointment appointmentDetails) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointment.setPatientId(appointmentDetails.getPatientId());
                    appointment.setPatientName(appointmentDetails.getPatientName());
                    appointment.setDoctorName(appointmentDetails.getDoctorName());
                    appointment.setAppointmentDate(appointmentDetails.getAppointmentDate());
                    appointment.setStartTime(appointmentDetails.getStartTime());
                    appointment.setEndTime(appointmentDetails.getEndTime());
                    appointment.setType(appointmentDetails.getType());
                    appointment.setStatus(appointmentDetails.getStatus());
                    appointment.setDuration(appointmentDetails.getDuration());
                    appointment.setNotes(appointmentDetails.getNotes());
                    if (appointmentDetails.getReminder() != null) {
                        appointment.setReminder(appointmentDetails.getReminder());
                    }
                    return appointmentRepository.save(appointment);
                })
                .orElseThrow(() -> new RuntimeException("Appointment not found with id " + id));
    }

    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }

    public List<Appointment> getAppointmentsByPatientId(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDate(date);
    }

    public List<Appointment> getAppointmentsByDateRange(LocalDate startDate, LocalDate endDate) {
        return appointmentRepository.findAppointmentsInDateRange(startDate, endDate);
    }

    public List<Appointment> getAppointmentsByStatus(AppointmentStatus status) {
        return appointmentRepository.findByStatus(status);
    }

    public boolean hasConflictingAppointments(LocalDate date, String startTime) {
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(date, startTime);
        return !conflicts.isEmpty();
    }

    public Appointment sendReminder(Long appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .map(appointment -> {
                    if (appointment.getReminder() == null) {
                        appointment.setReminder(new Reminder());
                    }
                    appointment.getReminder().setSent(true);
                    appointment.getReminder().setSentDate(LocalDateTime.now());
                    return appointmentRepository.save(appointment);
                })
                .orElseThrow(() -> new RuntimeException("Appointment not found with id " + appointmentId));
    }

    public List<Appointment> getAppointmentsForReminder(LocalDate date) {
        return appointmentRepository.findAppointmentsForReminder(date);
    }
}
