package com.smarthealthcare.controller;


import com.smarthealthcare.entity.Patient;
import com.smarthealthcare.service.PatientService;
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

    private final PatientService patientService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        Patient patient = patientService.getPatientProfile(userDetails.getUsername());
        return ResponseEntity.ok(patient);
    }

    @PostMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> createProfile(
            @RequestBody Patient patient,
            @AuthenticationPrincipal UserDetails userDetails) {
        Patient saved = patientService.createProfile(patient, userDetails.getUsername());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> updateProfile(
            @RequestBody Patient updatePatient,
            @AuthenticationPrincipal UserDetails userDetails) {
        Patient updated = patientService.updateProfile(updatePatient, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }

    @GetMapping
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }
}

