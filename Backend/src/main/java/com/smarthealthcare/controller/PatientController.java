package com.smarthealthcare.controller;


import com.smarthealthcare.entity.Patient;
import com.smarthealthcare.entity.User;
import com.smarthealthcare.repository.PatientRepository;
import com.smarthealthcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class PatientController {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not Found"));

        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        return ResponseEntity.ok(patient);
    }

    @PostMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> createProfile(
            @RequestBody Patient patient,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        patient.setUser(user);
        Patient saved = patientRepository.save(patient);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> updateProfile(
            @RequestBody Patient updatePatient,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Patient existing = patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        existing.setName(updatePatient.getName());
        existing.setAge(updatePatient.getAge());
        existing.setGender(updatePatient.getGender());
        existing.setPhone(updatePatient.getPhone());
        existing.setAddress(updatePatient.getAddress());
        existing.setBloodGroup(updatePatient.getBloodGroup());

        return ResponseEntity.ok(patientRepository.save(existing));
    }

    @GetMapping
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Patient>> getAllPatients() {

        return ResponseEntity.ok(patientRepository.findAll());
    }
}
