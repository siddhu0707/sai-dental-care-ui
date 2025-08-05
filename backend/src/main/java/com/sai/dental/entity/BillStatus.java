package com.sai.dental.entity;

public enum BillStatus {
    DRAFT("draft"),
    SENT("sent"),
    PAID("paid"),
    OVERDUE("overdue"),
    CANCELLED("cancelled"),
    PARTIAL("partial");

    private final String value;

    BillStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
