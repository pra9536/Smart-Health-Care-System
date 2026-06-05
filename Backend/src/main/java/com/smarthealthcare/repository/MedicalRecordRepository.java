package com.smarthealthcare.repository;

import com.smarthealthcare.entity.Doctor;
import com.smarthealthcare.entity.MedicalRecord;
import com.smarthealthcare.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicalRecordRepository
        extends JpaRepository<MedicalRecord, Long> {

    List<MedicalRecord> findByPatient(Patient patient);
    List<MedicalRecord> findByDoctor(Doctor doctor);
}
