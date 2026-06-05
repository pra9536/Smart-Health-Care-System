package com.smarthealthcare.controller;

import com.smarthealthcare.entity.*;
import com.smarthealthcare.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class RatingController {

    private final RatingRepository ratingRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    // ===== GIVE RATING (PATIENT only) =====
    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> giveRating(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found"));

        Long doctorId = Long.valueOf(request.get("doctorId").toString());
        int stars = Integer.parseInt(request.get("stars").toString());
        String review = request.getOrDefault("review", "").toString();

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found"));

        Rating rating = new Rating();
        rating.setDoctor(doctor);
        rating.setPatient(patient);
        rating.setStars(stars);
        rating.setReview(review);

        return ResponseEntity.ok(ratingRepository.save(rating));
    }

    // ===== GET RATINGS BY DOCTOR =====
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getDoctorRatings(
            @PathVariable Long doctorId) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found"));

        List<Rating> ratings = ratingRepository.findByDoctor(doctor);
        Double avg = ratingRepository
                .findAverageRatingByDoctor(doctor);

        return ResponseEntity.ok(Map.of(
                "ratings", ratings,
                "averageRating", avg != null ?
                        Math.round(avg * 10.0) / 10.0 : 0.0,
                "totalRatings", ratings.size()
        ));
    }
}