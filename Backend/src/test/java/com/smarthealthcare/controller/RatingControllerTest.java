package com.smarthealthcare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthealthcare.config.SecurityConfig;
import com.smarthealthcare.entity.Doctor;
import com.smarthealthcare.entity.Patient;
import com.smarthealthcare.entity.Rating;
import com.smarthealthcare.entity.User;
import com.smarthealthcare.repository.DoctorRepository;
import com.smarthealthcare.repository.PatientRepository;
import com.smarthealthcare.repository.RatingRepository;
import com.smarthealthcare.repository.UserRepository;
import com.smarthealthcare.security.JwtFilter;
import com.smarthealthcare.security.JwtUtil;
import com.smarthealthcare.security.CustomerUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RatingController.class)
@Import({SecurityConfig.class, JwtFilter.class})
public class RatingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private RatingRepository ratingRepository;

    @MockitoBean
    private DoctorRepository doctorRepository;

    @MockitoBean
    private PatientRepository patientRepository;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomerUserDetailsService customerUserDetailsService;

    private User testUserPatient;
    private Patient testPatient;
    private Doctor testDoctor;
    private Rating testRating;

    @BeforeEach
    void setUp() {
        testUserPatient = new User();
        testUserPatient.setId(1L);
        testUserPatient.setName("Patient Jane");
        testUserPatient.setEmail("jane@example.com");
        testUserPatient.setRole(User.Role.PATIENT);
        testUserPatient.setVerified(true);
        testUserPatient.setActive(true);

        testPatient = new Patient();
        testPatient.setId(2L);
        testPatient.setName("Patient Jane");
        testPatient.setUser(testUserPatient);

        testDoctor = new Doctor();
        testDoctor.setId(5L);
        testDoctor.setName("Dr. Gregory");

        testRating = new Rating();
        testRating.setId(10L);
        testRating.setDoctor(testDoctor);
        testRating.setPatient(testPatient);
        testRating.setStars(5);
        testRating.setReview("Excellent service!");
    }

    @Test
    @WithMockUser(username = "jane@example.com", roles = "PATIENT")
    void testGiveRatingSuccess() throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("doctorId", 5L);
        request.put("stars", 5);
        request.put("review", "Excellent service!");

        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(testUserPatient));
        when(patientRepository.findByUser(testUserPatient)).thenReturn(Optional.of(testPatient));
        when(doctorRepository.findById(5L)).thenReturn(Optional.of(testDoctor));
        when(ratingRepository.save(any(Rating.class))).thenReturn(testRating);

        mockMvc.perform(post("/api/ratings")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.stars").value(5))
                .andExpect(jsonPath("$.review").value("Excellent service!"));
    }

    @Test
    @WithMockUser
    void testGetDoctorRatingsSuccess() throws Exception {
        List<Rating> list = Collections.singletonList(testRating);
        when(doctorRepository.findById(5L)).thenReturn(Optional.of(testDoctor));
        when(ratingRepository.findByDoctor(testDoctor)).thenReturn(list);
        when(ratingRepository.findAverageRatingByDoctor(testDoctor)).thenReturn(5.0);

        mockMvc.perform(get("/api/ratings/doctor/{doctorId}", 5L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRatings").value(1))
                .andExpect(jsonPath("$.averageRating").value(5.0))
                .andExpect(jsonPath("$.ratings[0].id").value(10L));
    }
}
