package com.smarthealthcare.service;

import com.smarthealthcare.entity.Doctor;
import com.smarthealthcare.entity.User;
import com.smarthealthcare.repository.DoctorRepository;
import com.smarthealthcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository; 
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Cacheable(value = "doctors")
    public List<Doctor> getAllDoctors() {

        System.out.println("Fetching from DB...");
        return doctorRepository.findByActiveTrue();
    }

    @Cacheable(value = "doctors", key = "#specialization")
    public List<Doctor> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecialization(specialization);
    }

    public Doctor getDoctorById(Long id){
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
    }

    public List<Doctor> getAvailableDoctors() {
        return doctorRepository.findByAvailableTrue();
    }

    @CacheEvict(value = "doctors", allEntries = true)
    public Doctor saveDoctor(Doctor doctor){
        return doctorRepository.save(doctor);
    }

    @CacheEvict(value = "doctors", allEntries = true)
    public Doctor updateDoctor(Long id, Doctor updatedDoctor){
        Doctor existing = getDoctorById(id);
        existing.setName(updatedDoctor.getName());
        existing.setSpecialization(updatedDoctor.getSpecialization());
        existing.setExperienceYears(updatedDoctor.getExperienceYears());
        existing.setConsultationFee(updatedDoctor.getConsultationFee());
        existing.setAvailable(updatedDoctor.isAvailable());
        return doctorRepository.save(existing);
    }

    @CacheEvict(value = "doctors", allEntries = true)
    public void deleteDoctor(Long id){

        Doctor doctor = getDoctorById(id);

        doctor.setActive(false);
        doctorRepository.save(doctor);
        if(doctor.getUser() != null) {
            User user = doctor.getUser();
            user.setActive(false);
            userRepository.save(user);

            auditService.log(
                    "DOCTOR_DEACTIVATED",
                    "ADMIN",
                    "Doctor deactivated: " + doctor.getName() +
                            " | User: " + user.getEmail(),
                    "system"
            );
        }
    }


}
