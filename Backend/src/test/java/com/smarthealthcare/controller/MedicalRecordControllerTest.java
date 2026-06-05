package com.smarthealthcare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthealthcare.config.SecurityConfig;
import com.smarthealthcare.entity.Doctor;
import com.smarthealthcare.entity.MedicalRecord;
import com.smarthealthcare.entity.Patient;
import com.smarthealthcare.entity.User;
import com.smarthealthcare.repository.DoctorRepository;
import com.smarthealthcare.repository.MedicalRecordRepository;
import com.smarthealthcare.repository.PatientRepository;
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

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MedicalRecordController.class)
@Import({SecurityConfig.class, JwtFilter.class})
public class MedicalRecordControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private MedicalRecordRepository medicalRecordRepository;

    @MockitoBean
    private PatientRepository patientRepository;

    @MockitoBean
    private DoctorRepository doctorRepository;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomerUserDetailsService customerUserDetailsService;

    private User testUserDoctor;
    private User testUserPatient;
    private Doctor testDoctor;
    private Patient testPatient;
    private MedicalRecord testRecord;

    @BeforeEach
    void setUp() {
        testUserDoctor = new User();
        testUserDoctor.setId(1L);
        testUserDoctor.setName("Dr. Brown");
        testUserDoctor.setEmail("brown@example.com");
        testUserDoctor.setRole(User.Role.DOCTOR);
        testUserDoctor.setVerified(true);
        testUserDoctor.setActive(true);

        testUserPatient = new User();
        testUserPatient.setId(2L);
        testUserPatient.setName("Patient Jane");
        testUserPatient.setEmail("jane@example.com");
        testUserPatient.setRole(User.Role.PATIENT);
        testUserPatient.setVerified(true);
        testUserPatient.setActive(true);

        testDoctor = new Doctor();
        testDoctor.setId(10L);
        testDoctor.setName("Dr. Brown");
        testDoctor.setUser(testUserDoctor);

        testPatient = new Patient();
        testPatient.setId(20L);
        testPatient.setName("Patient Jane");
        testPatient.setUser(testUserPatient);

        testRecord = new MedicalRecord();
        testRecord.setId(100L);
        testRecord.setPatient(testPatient);
        testRecord.setDoctor(testDoctor);
        testRecord.setRecordDate(LocalDate.now());
        testRecord.setDiagnosis("Common cold");
        testRecord.setPrescription("Rest and warm fluids");
    }

    @Test
    @WithMockUser(username = "brown@example.com", roles = "DOCTOR")
    void testAddRecordDoctorSuccess() throws Exception {
        when(userRepository.findByEmail("brown@example.com")).thenReturn(Optional.of(testUserDoctor));
        when(doctorRepository.findByUserId(testUserDoctor.getId())).thenReturn(Optional.of(testDoctor));
        when(patientRepository.findById(20L)).thenReturn(Optional.of(testPatient));
        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenReturn(testRecord);

        mockMvc.perform(post("/api/medical-records")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testRecord)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100L))
                .andExpect(jsonPath("$.diagnosis").value("Common cold"));
    }

    @Test
    @WithMockUser(username = "jane@example.com", roles = "PATIENT")
    void testGetMyRecordsPatientSuccess() throws Exception {
        List<MedicalRecord> list = Collections.singletonList(testRecord);
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(testUserPatient));
        when(patientRepository.findByUser(testUserPatient)).thenReturn(Optional.of(testPatient));
        when(medicalRecordRepository.findByPatient(testPatient)).thenReturn(list);

        mockMvc.perform(get("/api/medical-records/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void testGetByPatientDoctorSuccess() throws Exception {
        List<MedicalRecord> list = Collections.singletonList(testRecord);
        when(patientRepository.findById(20L)).thenReturn(Optional.of(testPatient));
        when(medicalRecordRepository.findByPatient(testPatient)).thenReturn(list);

        mockMvc.perform(get("/api/medical-records/patient/{patientId}", 20L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllRecordsAdminSuccess() throws Exception {
        List<MedicalRecord> list = Collections.singletonList(testRecord);
        when(medicalRecordRepository.findAll()).thenReturn(list);

        mockMvc.perform(get("/api/medical-records/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteRecordAdminSuccess() throws Exception {
        doNothing().when(medicalRecordRepository).deleteById(100L);

        mockMvc.perform(delete("/api/medical-records/{id}", 100L)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("Record deleted successfully!"));
    }
}
