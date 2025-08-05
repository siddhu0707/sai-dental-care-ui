package com.sai.dental.controller;

import com.sai.dental.entity.ServiceCategory;
import com.sai.dental.entity.ServiceTemplate;
import com.sai.dental.service.ServiceTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/serviceTemplates")
@CrossOrigin(origins = "http://localhost:4200")
public class ServiceTemplateController {

    @Autowired
    private ServiceTemplateService serviceTemplateService;

    @GetMapping
    public List<ServiceTemplate> getAllServiceTemplates() {
        return serviceTemplateService.getAllServiceTemplates();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceTemplate> getServiceTemplateById(@PathVariable Long id) {
        return serviceTemplateService.getServiceTemplateById(id)
                .map(template -> ResponseEntity.ok().body(template))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ServiceTemplate createServiceTemplate(@Valid @RequestBody ServiceTemplate serviceTemplate) {
        return serviceTemplateService.saveServiceTemplate(serviceTemplate);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceTemplate> updateServiceTemplate(@PathVariable Long id, @Valid @RequestBody ServiceTemplate serviceTemplateDetails) {
        try {
            ServiceTemplate updatedTemplate = serviceTemplateService.updateServiceTemplate(id, serviceTemplateDetails);
            return ResponseEntity.ok(updatedTemplate);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteServiceTemplate(@PathVariable Long id) {
        try {
            serviceTemplateService.deleteServiceTemplate(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/category/{category}")
    public List<ServiceTemplate> getServiceTemplatesByCategory(@PathVariable ServiceCategory category) {
        return serviceTemplateService.getServiceTemplatesByCategory(category);
    }

    @GetMapping("/search")
    public List<ServiceTemplate> searchServiceTemplates(@RequestParam String name) {
        return serviceTemplateService.searchServiceTemplates(name);
    }
}
