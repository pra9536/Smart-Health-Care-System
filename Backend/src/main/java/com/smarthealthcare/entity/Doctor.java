package com.smarthealthcare.entity;

import jakarta.persistence.*;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String specialization;

    private int experienceYears;

    private double consultationFee;

    private String phone;

    private String qualification;

    @Column(nullable = false)
    private boolean available = true;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @Column(nullable = false)
    private boolean active = true;

}
