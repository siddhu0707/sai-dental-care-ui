package com.sai.dental.service;

import com.sai.dental.entity.*;
import com.sai.dental.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;

@Service
public class DataInitializationService implements CommandLineRunner {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ServiceTemplateRepository serviceTemplateRepository;

    @Override
    public void run(String... args) throws Exception {
        if (patientRepository.count() == 0) {
            initializeData();
        }
    }

    private void initializeData() {
        // Initialize Service Templates
        createServiceTemplates();

        // Initialize Patients
        Patient patient1 = createPatient1();
        Patient patient2 = createPatient2();

        // Initialize Appointments
        createAppointments(patient1, patient2);

        // Initialize Bills
        createBills(patient1, patient2);
    }

    private void createServiceTemplates() {
        ServiceTemplate cleaning = new ServiceTemplate();
        cleaning.setName("Routine Cleaning");
        cleaning.setCategory(ServiceCategory.CLEANING);
        cleaning.setDefaultPrice(BigDecimal.valueOf(2000));
        cleaning.setDescription("Standard dental cleaning and examination");
        serviceTemplateRepository.save(cleaning);

        ServiceTemplate extraction = new ServiceTemplate();
        extraction.setName("Tooth Extraction");
        extraction.setCategory(ServiceCategory.EXTRACTION);
        extraction.setDefaultPrice(BigDecimal.valueOf(4500));
        extraction.setDescription("Simple tooth extraction procedure");
        serviceTemplateRepository.save(extraction);

        ServiceTemplate rootCanal = new ServiceTemplate();
        rootCanal.setName("Root Canal");
        rootCanal.setCategory(ServiceCategory.ROOT_CANAL);
        rootCanal.setDefaultPrice(BigDecimal.valueOf(12000));
        rootCanal.setDescription("Root canal treatment procedure");
        serviceTemplateRepository.save(rootCanal);

        ServiceTemplate filling = new ServiceTemplate();
        filling.setName("Dental Filling");
        filling.setCategory(ServiceCategory.FILLING);
        filling.setDefaultPrice(BigDecimal.valueOf(3000));
        filling.setDescription("Composite dental filling");
        serviceTemplateRepository.save(filling);

        ServiceTemplate crown = new ServiceTemplate();
        crown.setName("Crown Placement");
        crown.setCategory(ServiceCategory.CROWN);
        crown.setDefaultPrice(BigDecimal.valueOf(15000));
        crown.setDescription("Porcelain crown placement");
        serviceTemplateRepository.save(crown);
    }

    private Patient createPatient1() {
        Patient patient = new Patient();
        patient.setFirstName("Rajesh");
        patient.setLastName("Kumar");
        patient.setEmail("rajesh.kumar@email.com");
        patient.setPhone("+91 98765 43210");
        patient.setDateOfBirth(LocalDate.of(1985, 3, 15));
        patient.setGender("Male");

        Address address = new Address("123 MG Road", "Bangalore", "Karnataka", "560001");
        patient.setAddress(address);

        patient.setMedicalHistory(Arrays.asList("Hypertension", "Diabetes Type 2"));
        patient.setAllergies(Arrays.asList("Penicillin"));

        EmergencyContact emergency = new EmergencyContact("Priya Kumar", "+91 98765 43211", "Spouse");
        patient.setEmergencyContact(emergency);

        patient.setLastVisit(LocalDateTime.of(2024, 1, 10, 10, 0));
        patient.setTotalVisits(8);
        patient.setNotes("Regular patient, good dental hygiene");

        return patientRepository.save(patient);
    }

    private Patient createPatient2() {
        Patient patient = new Patient();
        patient.setFirstName("Priya");
        patient.setLastName("Sharma");
        patient.setEmail("priya.sharma@email.com");
        patient.setPhone("+91 87654 32109");
        patient.setDateOfBirth(LocalDate.of(1992, 7, 22));
        patient.setGender("Female");

        Address address = new Address("456 Brigade Road", "Mumbai", "Maharashtra", "400001");
        patient.setAddress(address);

        patient.setMedicalHistory(Arrays.asList());
        patient.setAllergies(Arrays.asList("Latex"));

        EmergencyContact emergency = new EmergencyContact("Vikram Sharma", "+91 87654 32110", "Father");
        patient.setEmergencyContact(emergency);

        patient.setLastVisit(LocalDateTime.of(2024, 1, 5, 14, 0));
        patient.setTotalVisits(3);
        patient.setNotes("Nervous about dental procedures");

        return patientRepository.save(patient);
    }

    private void createAppointments(Patient patient1, Patient patient2) {
        Appointment appointment1 = new Appointment();
        appointment1.setPatientId(patient1.getId());
        appointment1.setPatientName(patient1.getFirstName() + " " + patient1.getLastName());
        appointment1.setDoctorName("Dr. Sai Prasad");
        appointment1.setAppointmentDate(LocalDate.of(2024, 1, 21));
        appointment1.setStartTime("09:00");
        appointment1.setEndTime("09:30");
        appointment1.setType(AppointmentType.FILLING);
        appointment1.setStatus(AppointmentStatus.CONFIRMED);
        appointment1.setDuration(30);
        appointment1.setNotes("Regular cleaning appointment");

        Reminder reminder1 = new Reminder(true, LocalDateTime.of(2024, 1, 21, 8, 0));
        appointment1.setReminder(reminder1);

        appointmentRepository.save(appointment1);

        Appointment appointment2 = new Appointment();
        appointment2.setPatientId(patient2.getId());
        appointment2.setPatientName(patient2.getFirstName() + " " + patient2.getLastName());
        appointment2.setDoctorName("Dr. Smith");
        appointment2.setAppointmentDate(LocalDate.of(2024, 1, 21));
        appointment2.setStartTime("10:30");
        appointment2.setEndTime("11:30");
        appointment2.setType(AppointmentType.EXTRACTION);
        appointment2.setStatus(AppointmentStatus.CANCELLED);
        appointment2.setDuration(60);
        appointment2.setNotes("Wisdom tooth extraction");

        Reminder reminder2 = new Reminder(true, LocalDateTime.now());
        appointment2.setReminder(reminder2);

        appointmentRepository.save(appointment2);
    }

    private void createBills(Patient patient1, Patient patient2) {
        // Bill 1
        Bill bill1 = new Bill();
        bill1.setPatientId(patient1.getId());
        bill1.setPatientName(patient1.getFirstName() + " " + patient1.getLastName());
        bill1.setBillNumber("INV-202401-001");
        bill1.setIssueDate(LocalDate.of(2024, 1, 14));
        bill1.setDueDate(LocalDate.of(2024, 2, 13));
        bill1.setSubtotal(BigDecimal.valueOf(2500));
        bill1.setTax(BigDecimal.valueOf(450));
        bill1.setDiscount(BigDecimal.valueOf(0));
        bill1.setTotal(BigDecimal.valueOf(2950));
        bill1.setStatus(BillStatus.PAID);
        bill1.setPaymentMethod(PaymentMethod.CREDIT_CARD);
        bill1.setPaymentDate(LocalDateTime.of(2024, 1, 21, 15, 30));
        bill1.setNotes("Regular cleaning appointment");

        BillItem item1 = new BillItem();
        item1.setDescription("Routine Dental Cleaning");
        item1.setCategory(ServiceCategory.CLEANING);
        item1.setQuantity(1);
        item1.setUnitPrice(BigDecimal.valueOf(2000));
        item1.setTotal(BigDecimal.valueOf(2000));
        bill1.addItem(item1);

        BillItem item2 = new BillItem();
        item2.setDescription("Fluoride Treatment");
        item2.setCategory(ServiceCategory.CLEANING);
        item2.setQuantity(1);
        item2.setUnitPrice(BigDecimal.valueOf(500));
        item2.setTotal(BigDecimal.valueOf(500));
        bill1.addItem(item2);

        billRepository.save(bill1);

        // Payment for Bill 1
        Payment payment1 = new Payment();
        payment1.setBillId(bill1.getId());
        payment1.setAmount(BigDecimal.valueOf(2950));
        payment1.setMethod(PaymentMethod.CREDIT_CARD);
        payment1.setDate(LocalDateTime.of(2024, 1, 21, 15, 30));
        payment1.setReference("PAY-CC123456");
        payment1.setNotes("Paid in full");
        paymentRepository.save(payment1);

        // Bill 2
        Bill bill2 = new Bill();
        bill2.setPatientId(patient2.getId());
        bill2.setPatientName(patient2.getFirstName() + " " + patient2.getLastName());
        bill2.setBillNumber("INV-202401-002");
        bill2.setIssueDate(LocalDate.of(2024, 1, 16));
        bill2.setDueDate(LocalDate.of(2024, 2, 15));
        bill2.setSubtotal(BigDecimal.valueOf(4800));
        bill2.setTax(BigDecimal.valueOf(864));
        bill2.setDiscount(BigDecimal.valueOf(0));
        bill2.setTotal(BigDecimal.valueOf(5664));
        bill2.setStatus(BillStatus.SENT);
        bill2.setNotes("Wisdom tooth extraction");

        BillItem item3 = new BillItem();
        item3.setDescription("Tooth Extraction");
        item3.setCategory(ServiceCategory.EXTRACTION);
        item3.setQuantity(1);
        item3.setUnitPrice(BigDecimal.valueOf(4500));
        item3.setTotal(BigDecimal.valueOf(4500));
        bill2.addItem(item3);

        BillItem item4 = new BillItem();
        item4.setDescription("Post-extraction Care Kit");
        item4.setCategory(ServiceCategory.MEDICATION);
        item4.setQuantity(1);
        item4.setUnitPrice(BigDecimal.valueOf(300));
        item4.setTotal(BigDecimal.valueOf(300));
        bill2.addItem(item4);

        billRepository.save(bill2);
    }
}
