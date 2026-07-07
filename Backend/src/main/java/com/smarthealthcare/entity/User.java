package com.smarthealthcare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name="users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String name;

    @Column(nullable=false, unique=true)
    private String email;


    @Column(nullable=false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private Role role;

    private String otp;

    private LocalDateTime otpExpiry;

    private boolean verified = false;

    @Column(nullable = false)
    private boolean active = true;

    private String resetToken;

    private LocalDateTime resetTokenExpiry;

    public enum Role {
        ADMIN, DOCTOR, PATIENT
    }
}