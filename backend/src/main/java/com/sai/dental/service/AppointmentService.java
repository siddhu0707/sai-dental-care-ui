package com.sai.dental.service;

import com.sai.dental.entity.Appointment;
import com.sai.dental.entity.AppointmentStatus;
import com.sai.dental.entity.Reminder;
import com.sai.dental.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;
    
    private final String TOKEN = "EAAJWxQ7GZBf0BPFrhEZCTZAnI0O1ZCoMjScCbQZAFijOZBXdJRvoVDVnQKSXZCnrhLecSdF9ufi60hko5aHFblpjrLGE9GoxQs9LxaPN6K16lvnLnEbKxG7BMq6z9m3QjHYTcXqvZCsHAT5s0RAx2IvCIJmmZCtCIXFLVIaEChGR1qDjtTHRx7ABXwrybgf5NEWM7LIA2ZCoQVZBf1F0jsK92YgHrG7Mg93QPaYGZBhy5APIROMDvkorpOnZChibvw9anDQZDZD";
    private final String PHONE_NUMBER_ID = "734312796430500";//475473372313270
    
    

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
    	
    	
    	
    	 try {
             String url = "https://graph.facebook.com/v18.0/" + PHONE_NUMBER_ID + "/messages";

             RestTemplate restTemplate = new RestTemplate();
             HttpHeaders headers = new HttpHeaders();
             headers.setContentType(MediaType.APPLICATION_JSON);
             headers.setBearerAuth(TOKEN);

             Map<String, Object> body = new HashMap<>();
             body.put("messaging_product", "whatsapp");
             body.put("to", "91" + "7507532330");
             body.put("type", "template");
             Map<String, Object> template = new HashMap<>();
             template.put("name", "appointment_reminder");

             // language: { code: "en_US" }
             Map<String, String> language = new HashMap<>();
             language.put("code", "en_US");
             template.put("language", language);

             // parameters
             List<Map<String, Object>> parameters = new ArrayList<>();

             Map<String, Object> param1 = new HashMap<>();
             param1.put("type", "text");
             param1.put("text", "Siddhu");

             Map<String, Object> param2 = new HashMap<>();
             param2.put("type", "text");
             param2.put("text", "Today");

             Map<String, Object> param3 = new HashMap<>();
             param3.put("type", "text");
             param3.put("text", "Sai Dental Care");

             parameters.add(param1);
             parameters.add(param2);
             parameters.add(param3);

             // component
             Map<String, Object> component = new HashMap<>();
             component.put("type", "body");
             component.put("parameters", parameters);

             List<Map<String, Object>> components = new ArrayList<>();
             components.add(component);

             template.put("components", components);

             body.put("template", template);

             HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
             ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

              ResponseEntity.ok(response.getBody());
         } catch (Exception e) {
              ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                  .body("Failed: " + e.getMessage());
         }
    	
    	
    	
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
