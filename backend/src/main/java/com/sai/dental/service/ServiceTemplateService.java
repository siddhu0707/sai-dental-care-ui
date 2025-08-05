package com.sai.dental.service;

import com.sai.dental.entity.ServiceCategory;
import com.sai.dental.entity.ServiceTemplate;
import com.sai.dental.repository.ServiceTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ServiceTemplateService {

    @Autowired
    private ServiceTemplateRepository serviceTemplateRepository;

    public List<ServiceTemplate> getAllServiceTemplates() {
        return serviceTemplateRepository.findAll();
    }

    public Optional<ServiceTemplate> getServiceTemplateById(Long id) {
        return serviceTemplateRepository.findById(id);
    }

    public ServiceTemplate saveServiceTemplate(ServiceTemplate serviceTemplate) {
        return serviceTemplateRepository.save(serviceTemplate);
    }

    public ServiceTemplate updateServiceTemplate(Long id, ServiceTemplate serviceTemplateDetails) {
        return serviceTemplateRepository.findById(id)
                .map(template -> {
                    template.setName(serviceTemplateDetails.getName());
                    template.setCategory(serviceTemplateDetails.getCategory());
                    template.setDefaultPrice(serviceTemplateDetails.getDefaultPrice());
                    template.setDescription(serviceTemplateDetails.getDescription());
                    return serviceTemplateRepository.save(template);
                })
                .orElseThrow(() -> new RuntimeException("Service template not found with id " + id));
    }

    public void deleteServiceTemplate(Long id) {
        serviceTemplateRepository.deleteById(id);
    }

    public List<ServiceTemplate> getServiceTemplatesByCategory(ServiceCategory category) {
        return serviceTemplateRepository.findByCategory(category);
    }

    public List<ServiceTemplate> searchServiceTemplates(String name) {
        return serviceTemplateRepository.findByNameContainingIgnoreCase(name);
    }
}
