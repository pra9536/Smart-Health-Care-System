package com.smarthealthcare.controller;

import com.smarthealthcare.entity.Doctor;
import com.smarthealthcare.entity.MedicalRecord;
import com.smarthealthcare.entity.Patient;
import com.smarthealthcare.entity.User;
import com.smarthealthcare.repository.DoctorRepository;
import com.smarthealthcare.repository.MedicalRecordRepository;
import com.smarthealthcare.repository.PatientRepository;
import com.smarthealthcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class MedicalRecordController {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    // ===== ADD MEDICAL RECORD (DOCTOR only) =====
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> addRecord(
            @RequestBody MedicalRecord record,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException(
                        "Doctor profile not found."
                ));

        if(record.getPatient() == null || record.getPatient().getId() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Please select a patient"));
        }

        Patient patient = patientRepository.findById(record.getPatient().getId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + record.getPatient().getId()));

        record.setDoctor(doctor);
        record.setPatient(patient);

        if(record.getRecordDate() == null) {
            record.setRecordDate(java.time.LocalDate.now());
        }

        MedicalRecord saved = medicalRecordRepository.save(record);
        return ResponseEntity.ok(saved);

    }

    // ===== GET MY MEDICAL RECORDS (PATIENT only) =====
    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<MedicalRecord>> getMyRecords(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        return ResponseEntity.ok(
                medicalRecordRepository.findByPatient(patient));
    }

    // ===== GET RECORDS WRITTEN BY ME (DOCTOR only) =====
    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<MedicalRecord>> getDoctorWrittenRecords(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

        return ResponseEntity.ok(
                medicalRecordRepository.findByDoctor(doctor));
    }

    // ===== GET RECORDS BY PATIENT ID (DOCTOR or ADMIN) =====
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<MedicalRecord>> getByPatient(
            @PathVariable Long patientId) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        return ResponseEntity.ok(
                medicalRecordRepository.findByPatient(patient));
    }

    // ===== GET ALL RECORDS (ADMIN only) =====
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MedicalRecord>> getAllRecords() {
        return ResponseEntity.ok(medicalRecordRepository.findAll());
    }

    // ===== DELETE RECORD (ADMIN only) =====
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteRecord(@PathVariable Long id) {
        medicalRecordRepository.deleteById(id);
        return ResponseEntity.ok("Record deleted successfully!");
    }
}
