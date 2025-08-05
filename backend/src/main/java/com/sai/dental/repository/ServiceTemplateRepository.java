package com.sai.dental.repository;

import com.sai.dental.entity.ServiceCategory;
import com.sai.dental.entity.ServiceTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceTemplateRepository extends JpaRepository<ServiceTemplate, Long> {
    
    List<ServiceTemplate> findByCategory(ServiceCategory category);
    
    List<ServiceTemplate> findByNameContainingIgnoreCase(String name);
}
