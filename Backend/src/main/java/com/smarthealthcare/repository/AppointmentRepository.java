package com.smarthealthcare.repository;

import com.smarthealthcare.entity.Appointment;
import com.smarthealthcare.entity.Doctor;
import com.smarthealthcare.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient(Patient patient);
    List<Appointment> findByDoctor(Doctor doctor);
    List<Appointment> findByStatus(Appointment.Status status);
}
