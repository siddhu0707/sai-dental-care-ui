package com.sai.dental.entity;

public enum AppointmentType {
    CONSULTATION("Consultation"),
    CLEANING("Routine Cleaning"),
    FILLING("Dental Filling"),
    EXTRACTION("Tooth Extraction"),
    ROOT_CANAL("Root Canal"),
    CROWN("Crown Placement"),
    IMPLANT("Dental Implant"),
    ORTHODONTICS("Orthodontic Treatment"),
    EMERGENCY("Emergency Visit"),
    FOLLOW_UP("Follow-up Visit");

    private final String displayName;

    AppointmentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
