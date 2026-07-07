package com.smarthealthcare.config;

import com.smarthealthcare.entity.Doctor;
import com.smarthealthcare.entity.Patient;
import com.smarthealthcare.entity.User;
import com.smarthealthcare.repository.DoctorRepository;
import com.smarthealthcare.repository.PatientRepository;
import com.smarthealthcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedDoctors();
        seedPatients();
    }

    private void seedDoctors() {
        String defaultPassword = passwordEncoder.encode("password123");

        // Doctor 1
        if (!userRepository.existsByEmail("doctor1@smarthealthcare.com")) {
            User user1 = new User();
            user1.setName("Dr. Prateek Yadav");
            user1.setEmail("doctor1@smarthealthcare.com");
            user1.setPassword(defaultPassword);
            user1.setRole(User.Role.DOCTOR);
            user1.setVerified(true);
            user1.setActive(true);
            userRepository.save(user1);

            Doctor doc1 = new Doctor();
            doc1.setName("Dr. Prateek Yadav");
            doc1.setSpecialization("General Physician");
            doc1.setExperienceYears(10);
            doc1.setConsultationFee(300.0);
            doc1.setPhone("9876543210");
            doc1.setQualification("MBBS, MD");
            doc1.setAvailable(true);
            doc1.setUser(user1);
            doc1.setActive(true);
            doctorRepository.save(doc1);
        }

        // Doctor 2
        if (!userRepository.existsByEmail("doctor2@smarthealthcare.com")) {
            User user2 = new User();
            user2.setName("Dr. Shalini Sharma");
            user2.setEmail("doctor2@smarthealthcare.com");
            user2.setPassword(defaultPassword);
            user2.setRole(User.Role.DOCTOR);
            user2.setVerified(true);
            user2.setActive(true);
            userRepository.save(user2);

            Doctor doc2 = new Doctor();
            doc2.setName("Dr. Shalini Sharma");
            doc2.setSpecialization("Cardiologist");
            doc2.setExperienceYears(15);
            doc2.setConsultationFee(800.0);
            doc2.setPhone("9876543211");
            doc2.setQualification("MBBS, MD, DM (Cardiology)");
            doc2.setAvailable(true);
            doc2.setUser(user2);
            doc2.setActive(true);
            doctorRepository.save(doc2);
        }

        // Doctor 3
        if (!userRepository.existsByEmail("doctor3@smarthealthcare.com")) {
            User user3 = new User();
            user3.setName("Dr. Amit Verma");
            user3.setEmail("doctor3@smarthealthcare.com");
            user3.setPassword(defaultPassword);
            user3.setRole(User.Role.DOCTOR);
            user3.setVerified(true);
            user3.setActive(true);
            userRepository.save(user3);

            Doctor doc3 = new Doctor();
            doc3.setName("Dr. Amit Verma");
            doc3.setSpecialization("Pediatrician");
            doc3.setExperienceYears(8);
            doc3.setConsultationFee(400.0);
            doc3.setPhone("9876543212");
            doc3.setQualification("MBBS, DCH");
            doc3.setAvailable(true);
            doc3.setUser(user3);
            doc3.setActive(true);
            doctorRepository.save(doc3);
        }

        // Doctor 4
        if (!userRepository.existsByEmail("doctor4@smarthealthcare.com")) {
            User user4 = new User();
            user4.setName("Dr. Rajesh Gupta");
            user4.setEmail("doctor4@smarthealthcare.com");
            user4.setPassword(defaultPassword);
            user4.setRole(User.Role.DOCTOR);
            user4.setVerified(true);
            user4.setActive(true);
            userRepository.save(user4);

            Doctor doc4 = new Doctor();
            doc4.setName("Dr. Rajesh Gupta");
            doc4.setSpecialization("Dermatologist");
            doc4.setExperienceYears(12);
            doc4.setConsultationFee(500.0);
            doc4.setPhone("9876543213");
            doc4.setQualification("MBBS, DVD");
            doc4.setAvailable(true);
            doc4.setUser(user4);
            doc4.setActive(true);
            doctorRepository.save(doc4);
        }
    }

    private void seedPatients() {
        String defaultPassword = passwordEncoder.encode("password123");

        // Patient 1
        if (!userRepository.existsByEmail("patient1@smarthealthcare.com")) {
            User user1 = new User();
            user1.setName("Ramesh Kumar");
            user1.setEmail("patient1@smarthealthcare.com");
            user1.setPassword(defaultPassword);
            user1.setRole(User.Role.PATIENT);
            user1.setVerified(true);
            user1.setActive(true);
            userRepository.save(user1);

            Patient pat1 = new Patient();
            pat1.setName("Ramesh Kumar");
            pat1.setAge(35);
            pat1.setGender("Male");
            pat1.setPhone("9988776655");
            pat1.setAddress("123, Sector 15, Noida");
            pat1.setBloodGroup("O+");
            pat1.setUser(user1);
            patientRepository.save(pat1);
        }

        // Patient 2
        if (!userRepository.existsByEmail("patient2@smarthealthcare.com")) {
            User user2 = new User();
            user2.setName("Sunita Devi");
            user2.setEmail("patient2@smarthealthcare.com");
            user2.setPassword(defaultPassword);
            user2.setRole(User.Role.PATIENT);
            user2.setVerified(true);
            user2.setActive(true);
            userRepository.save(user2);

            Patient pat2 = new Patient();
            pat2.setName("Sunita Devi");
            pat2.setAge(28);
            pat2.setGender("Female");
            pat2.setPhone("9988776656");
            pat2.setAddress("456, Phase 2, Gurugram");
            pat2.setBloodGroup("A+");
            pat2.setUser(user2);
            patientRepository.save(pat2);
        }
    }
}
