package com.smarthealthcare.repository;

import com.smarthealthcare.entity.Patient;
import com.smarthealthcare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByUser(User user);
}
