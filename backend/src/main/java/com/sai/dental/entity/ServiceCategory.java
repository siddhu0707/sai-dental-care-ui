package com.sai.dental.entity;

public enum ServiceCategory {
    CONSULTATION("consultation"),
    CLEANING("cleaning"),
    FILLING("filling"),
    EXTRACTION("extraction"),
    ROOT_CANAL("root_canal"),
    CROWN("crown"),
    IMPLANT("implant"),
    ORTHODONTICS("orthodontics"),
    COSMETIC("cosmetic"),
    EMERGENCY("emergency"),
    MEDICATION("medication"),
    OTHER("other");

    private final String value;

    ServiceCategory(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
