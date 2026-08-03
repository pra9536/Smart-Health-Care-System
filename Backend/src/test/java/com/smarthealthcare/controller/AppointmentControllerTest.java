package com.smarthealthcare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthealthcare.config.SecurityConfig;
import com.smarthealthcare.dto.AppointmentRequest;
import com.smarthealthcare.entity.Appointment;
import com.smarthealthcare.entity.Patient;
import com.smarthealthcare.entity.User;
import com.smarthealthcare.repository.PatientRepository;
import com.smarthealthcare.repository.UserRepository;
import com.smarthealthcare.security.JwtFilter;
import com.smarthealthcare.security.JwtUtil;
import com.smarthealthcare.security.CustomerUserDetailsService;
import com.smarthealthcare.service.AppointmentService;
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
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AppointmentController.class)
@Import({SecurityConfig.class, JwtFilter.class})
public class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AppointmentService appointmentService;

    @MockitoBean
    private PatientRepository patientRepository;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomerUserDetailsService customerUserDetailsService;

    private User testUser;
    private Patient testPatient;
    private Appointment testAppointment;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Patient Jane");
        testUser.setEmail("jane@example.com");
        testUser.setPassword("encoded");
        testUser.setRole(User.Role.PATIENT);
        testUser.setVerified(true);
        testUser.setActive(true);

        testPatient = new Patient();
        testPatient.setId(2L);
        testPatient.setName("Patient Jane");
        testPatient.setUser(testUser);

        testAppointment = new Appointment();
        testAppointment.setId(100L);
        testAppointment.setPatient(testPatient);
        testAppointment.setAppointmentDate(LocalDate.now().plusDays(2));
        testAppointment.setAppointmentTime(LocalTime.of(10, 0));
        testAppointment.setSymptoms("Fever and cough");
        testAppointment.setStatus(Appointment.Status.PENDING);
    }

    @Test
    @WithMockUser(username = "jane@example.com", roles = "PATIENT")
    void testBookAppointmentPatientSuccess() throws Exception {
        AppointmentRequest request = new AppointmentRequest();
        request.setDoctorId(5L);
        request.setAppointmentDate(LocalDate.now().plusDays(2));
        request.setAppointmentTime(LocalTime.of(10, 0));
        request.setSymptoms("Fever and cough");

        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(testUser));
        when(patientRepository.findByUser(testUser)).thenReturn(Optional.of(testPatient));
        when(appointmentService.bookAppointment(any(AppointmentRequest.class), any(Patient.class)))
                .thenReturn(testAppointment);

        mockMvc.perform(post("/api/appointments/book")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100L))
                .andExpect(jsonPath("$.symptoms").value("Fever and cough"));
    }

    @Test
    @WithMockUser(username = "jane@example.com", roles = "PATIENT")
    void testGetMyAppointmentsSuccess() throws Exception {
        List<Appointment> list = Collections.singletonList(testAppointment);
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(testUser));
        when(patientRepository.findByUser(testUser)).thenReturn(Optional.of(testPatient));
        when(appointmentService.getAppointmentsByPatient(testPatient)).thenReturn(list);

        mockMvc.perform(get("/api/appointments/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void testGetAppointmentsByDoctorSuccess() throws Exception {
        List<Appointment> list = Collections.singletonList(testAppointment);
        when(appointmentService.getAppointmentsByDoctorId(5L)).thenReturn(list);

        mockMvc.perform(get("/api/appointments/doctor/{doctorId}", 5L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void testUpdateStatusSuccess() throws Exception {
        testAppointment.setStatus(Appointment.Status.CONFIRMED);
        when(appointmentService.updateStatus(eq(100L), eq("CONFIRMED"))).thenReturn(testAppointment);

        mockMvc.perform(put("/api/appointments/{id}/status", 100L)
                        .with(csrf())
                        .param("status", "CONFIRMED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllAppointmentsAdminSuccess() throws Exception {
        List<Appointment> list = Collections.singletonList(testAppointment);
        when(appointmentService.getAllAppointments()).thenReturn(list);

        mockMvc.perform(get("/api/appointments/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void testCancelAppointmentPatientSuccess() throws Exception {
        testAppointment.setStatus(Appointment.Status.CANCELLED);
        when(appointmentService.updateStatus(eq(100L), eq("CANCELLED"))).thenReturn(testAppointment);

        mockMvc.perform(put("/api/appointments/{id}/cancel", 100L)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }
}
