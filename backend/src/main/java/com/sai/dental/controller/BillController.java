package com.sai.dental.controller;

import com.sai.dental.entity.Bill;
import com.sai.dental.entity.BillStatus;
import com.sai.dental.entity.PaymentMethod;
import com.sai.dental.service.BillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "http://localhost:4200")
public class BillController {

    @Autowired
    private BillService billService;

    @GetMapping
    public List<Bill> getAllBills() {
        return billService.getAllBills();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBillById(@PathVariable Long id) {
        return billService.getBillById(id)
                .map(bill -> ResponseEntity.ok().body(bill))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Bill createBill(@Valid @RequestBody Bill bill) {
        return billService.saveBill(bill);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bill> updateBill(@PathVariable Long id, @Valid @RequestBody Bill billDetails) {
        try {
            Bill updatedBill = billService.updateBill(id, billDetails);
            return ResponseEntity.ok(updatedBill);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Bill> patchBill(@PathVariable Long id, @RequestBody Bill billDetails) {
        try {
            Bill updatedBill = billService.updateBill(id, billDetails);
            return ResponseEntity.ok(updatedBill);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBill(@PathVariable Long id) {
        try {
            billService.deleteBill(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/patient/{patientId}")
    public List<Bill> getBillsByPatientId(@PathVariable Long patientId) {
        return billService.getBillsByPatientId(patientId);
    }

    @GetMapping("/status/{status}")
    public List<Bill> getBillsByStatus(@PathVariable BillStatus status) {
        return billService.getBillsByStatus(status);
    }

    @GetMapping("/overdue")
    public List<Bill> getOverdueBills() {
        return billService.getOverdueBills();
    }

    @GetMapping("/date-range")
    public List<Bill> getBillsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return billService.getBillsByDateRange(startDate, endDate);
    }

    @PostMapping("/{id}/mark-paid")
    public ResponseEntity<Bill> markAsPaid(@PathVariable Long id, @RequestParam PaymentMethod paymentMethod) {
        try {
            Bill bill = billService.markAsPaid(id, paymentMethod);
            return ResponseEntity.ok(bill);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
