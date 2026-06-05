package com.smarthealthcare.controller;

import com.smarthealthcare.dto.ApiResponse;
import com.smarthealthcare.entity.Doctor;
import com.smarthealthcare.entity.User;
import com.smarthealthcare.repository.DoctorRepository;
import com.smarthealthcare.repository.UserRepository;
import com.smarthealthcare.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class DoctorController {

    private final DoctorService doctorService;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> getMyDoctorProfile(
            @AuthenticationPrincipal UserDetails userDetails
            ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

        return ResponseEntity.ok(doctor);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Doctor>>> getAllDoctors() {
        List<Doctor> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(
                ApiResponse.success(doctors, "Doctors fetched successfully")
        );
    }

    @GetMapping("/paginated")
    public ResponseEntity<?> getDoctorsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy
    ) {
        Pageable pageable = (Pageable) PageRequest.of(page, size,
                Sort.by(sortBy).ascending());

        Page<Doctor> doctorPage = doctorRepository.findAll(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("doctors", doctorPage.getContent());
        response.put("currentPage", doctorPage.getNumber());
        response.put("totalItems", doctorPage.getTotalElements());
        response.put("hasNext", doctorPage.hasNext());
        response.put("hasPrevious", doctorPage.hasPrevious());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @GetMapping("/specialization/{spec}")
    public ResponseEntity<List<Doctor>> getBySpecialization(@PathVariable String spec) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialization(spec));
    }

    @GetMapping("/available")
    public ResponseEntity<List<Doctor>> getAvailableDoctors() {
        return ResponseEntity.ok(doctorService.getAvailableDoctors());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Doctor> addDoctor(@RequestBody Doctor doctor) {
        doctor.setUser(null);
        return ResponseEntity.ok(doctorService.saveDoctor(doctor));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable Long id,
                                               @RequestBody Doctor doctor) {
        return ResponseEntity.ok(doctorService.updateDoctor(id, doctor));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok().body("Doctor deleted successfully!");
    }


    // TEMPORARY DEBUG — delete after fixing
    @GetMapping("/debug")
    public ResponseEntity<?> debug(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("not found"));

        return ResponseEntity.ok(Map.of(
                "userId", user.getId(),
                "email", user.getEmail(),
                "doctor", doctorRepository.findByUserId(user.getId())
                        .map(d -> Map.of("id", d.getId(), "name", d.getName()))
                        .orElse(null)
        ));
    }
}
