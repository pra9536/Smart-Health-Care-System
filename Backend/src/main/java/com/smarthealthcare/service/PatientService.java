package com.smarthealthcare.service;

import com.smarthealthcare.entity.Patient;
import com.smarthealthcare.entity.User;
import com.smarthealthcare.repository.PatientRepository;
import com.smarthealthcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @Cacheable(value = "patientProfile", key = "#email")
    public Patient getPatientProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not Found"));
        return patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
    }

    @CacheEvict(value = "patientProfile", key = "#email")
    public Patient createProfile(Patient patient, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        patient.setUser(user);
        return patientRepository.save(patient);
    }

    @CacheEvict(value = "patientProfile", key = "#email")
    public Patient updateProfile(Patient updatePatient, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Patient existing = patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        existing.setName(updatePatient.getName());
        existing.setAge(updatePatient.getAge());
        existing.setGender(updatePatient.getGender());
        existing.setPhone(updatePatient.getPhone());
        existing.setAddress(updatePatient.getAddress());
        existing.setBloodGroup(updatePatient.getBloodGroup());

        return patientRepository.save(existing);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }
}

