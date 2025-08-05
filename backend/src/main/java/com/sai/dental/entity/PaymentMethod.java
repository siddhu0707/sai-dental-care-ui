package com.sai.dental.entity;

public enum PaymentMethod {
    CASH("cash"),
    CREDIT_CARD("credit_card"),
    DEBIT_CARD("debit_card"),
    CHECK("check"),
    INSURANCE("insurance"),
    BANK_TRANSFER("bank_transfer");

    private final String value;

    PaymentMethod(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
