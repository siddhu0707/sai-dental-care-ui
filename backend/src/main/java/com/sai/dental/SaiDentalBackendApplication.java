package com.sai.dental;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.sai.dental")
public class SaiDentalBackendApplication {

    public static void main(String[] args) {
        System.out.println("Starting Sai Dental Backend Application...");
        SpringApplication.run(SaiDentalBackendApplication.class, args);
        System.out.println("Application started successfully!");
    }

}
