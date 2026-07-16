package com.smarthealthcare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthealthcare.entity.Patient;
import com.smarthealthcare.entity.User;
import com.smarthealthcare.service.PatientService;
import com.smarthealthcare.security.JwtUtil;
import com.smarthealthcare.security.CustomerUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import com.smarthealthcare.config.SecurityConfig;
import com.smarthealthcare.security.JwtFilter;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PatientController.class)
@Import({SecurityConfig.class, JwtFilter.class})
public class PatientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PatientService patientService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomerUserDetailsService customerUserDetailsService;



    private User testUser;
    private Patient testPatient;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("John Smith");
        testUser.setEmail("smith@example.com");
        testUser.setPassword("encoded");
        testUser.setRole(User.Role.PATIENT);
        testUser.setVerified(true);
        testUser.setActive(true);

        testPatient = new Patient();
        testPatient.setId(5L);
        testPatient.setName("John Smith");
        testPatient.setAge(30);
        testPatient.setGender("Male");
        testPatient.setPhone("1234567890");
        testPatient.setAddress("123 Main St");
        testPatient.setBloodGroup("O+");
        testPatient.setUser(testUser);
    }

    @Test
    @WithMockUser(username = "smith@example.com", roles = "PATIENT")
    void testGetMyProfileSuccess() throws Exception {
        when(patientService.getPatientProfile("smith@example.com")).thenReturn(testPatient);

        mockMvc.perform(get("/api/patients/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5L))
                .andExpect(jsonPath("$.name").value("John Smith"))
                .andExpect(jsonPath("$.bloodGroup").value("O+"));
    }

    @Test
    @WithMockUser(username = "smith@example.com", roles = "PATIENT")
    void testCreateProfileSuccess() throws Exception {
        when(patientService.createProfile(any(Patient.class), eq("smith@example.com"))).thenReturn(testPatient);

        mockMvc.perform(post("/api/patients/profile")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testPatient)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5L));
    }

    @Test
    @WithMockUser(username = "smith@example.com", roles = "PATIENT")
    void testUpdateProfileSuccess() throws Exception {
        when(patientService.updateProfile(any(Patient.class), eq("smith@example.com"))).thenReturn(testPatient);

        mockMvc.perform(put("/api/patients/profile")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testPatient)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5L))
                .andExpect(jsonPath("$.name").value("John Smith"));
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void testGetAllPatientsDoctorSuccess() throws Exception {
        List<Patient> patients = Collections.singletonList(testPatient);
        when(patientService.getAllPatients()).thenReturn(patients);

        mockMvc.perform(get("/api/patients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(5L));
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void testGetAllPatientsPatientForbidden() throws Exception {
        mockMvc.perform(get("/api/patients"))
                .andExpect(status().isForbidden());
    }
}

