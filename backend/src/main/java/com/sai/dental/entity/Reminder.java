package com.sai.dental.entity;

import jakarta.persistence.Embeddable;

import java.time.LocalDateTime;

@Embeddable
public class Reminder {
    
    private Boolean sent = false;
    private LocalDateTime sentDate;

    public Reminder() {}

    public Reminder(Boolean sent, LocalDateTime sentDate) {
        this.sent = sent;
        this.sentDate = sentDate;
    }

    public Boolean getSent() {
        return sent;
    }

    public void setSent(Boolean sent) {
        this.sent = sent;
    }

    public LocalDateTime getSentDate() {
        return sentDate;
    }

    public void setSentDate(LocalDateTime sentDate) {
        this.sentDate = sentDate;
    }
}
