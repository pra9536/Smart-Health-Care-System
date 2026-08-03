package com.smarthealthcare.repository;

import com.smarthealthcare.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findByActiveTrue();
    List<Doctor> findBySpecialization(String specialization);
    List<Doctor> findByAvailableTrue();

    Optional<Doctor> findByUserId(Long userId);
}
