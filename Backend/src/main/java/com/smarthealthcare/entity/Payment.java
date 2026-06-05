package com.smarthealthcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String transactionId;

    @Column(nullable = false)
    private String paymentMethod; // e.g. "CARD", "UPI", "NETBANKING"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.SUCCESS;

    @Column(nullable = false)
    private LocalDateTime paymentDate = LocalDateTime.now();

    public enum PaymentStatus {
        SUCCESS, FAILED, PENDING
    }
}
