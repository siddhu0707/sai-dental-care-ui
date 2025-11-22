package com.sai.dental.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:4200")
public class TestController {

    @GetMapping
    public String test() {
        System.out.println("GET /api/test called");
        return "Backend is working!";
    }

    @PostMapping
    public String testPost(@RequestBody String data) {
        System.out.println("POST /api/test called with data: " + data);
        return "POST is working! Received: " + data;
    }
}
