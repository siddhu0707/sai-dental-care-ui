package com.sai.dental.entity;

public enum AppointmentStatus {
    SCHEDULED("scheduled"),
    CONFIRMED("confirmed"),
    IN_PROGRESS("in-progress"),
    COMPLETED("completed"),
    CANCELLED("cancelled"),
    NO_SHOW("no-show"),
    RESCHEDULED("rescheduled");

    private final String value;

    AppointmentStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
