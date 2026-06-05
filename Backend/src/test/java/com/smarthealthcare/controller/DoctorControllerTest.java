package com.smarthealthcare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthealthcare.dto.ApiResponse;
import com.smarthealthcare.entity.Doctor;
import com.smarthealthcare.entity.User;
import com.smarthealthcare.repository.DoctorRepository;
import com.smarthealthcare.repository.UserRepository;
import com.smarthealthcare.security.JwtUtil;
import com.smarthealthcare.security.CustomerUserDetailsService;
import com.smarthealthcare.security.JwtFilter;
import com.smarthealthcare.service.DoctorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.smarthealthcare.config.SecurityConfig;
import org.springframework.context.annotation.Import;

@WebMvcTest(DoctorController.class)
@Import({SecurityConfig.class, JwtFilter.class})
public class DoctorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DoctorService doctorService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private DoctorRepository doctorRepository;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomerUserDetailsService customerUserDetailsService;


    private User testUser;
    private Doctor testDoctor;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Doctor House");
        testUser.setEmail("house@example.com");
        testUser.setPassword("encoded");
        testUser.setRole(User.Role.DOCTOR);
        testUser.setVerified(true);
        testUser.setActive(true);

        testDoctor = new Doctor();
        testDoctor.setId(10L);
        testDoctor.setName("Gregory House");
        testDoctor.setSpecialization("Diagnostic Medicine");
        testDoctor.setAvailable(true);
        testDoctor.setUser(testUser);
    }

    @Test
    @WithMockUser(username = "house@example.com", roles = "DOCTOR")
    void testGetMyDoctorProfileSuccess() throws Exception {
        when(userRepository.findByEmail("house@example.com")).thenReturn(Optional.of(testUser));
        when(doctorRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testDoctor));

        mockMvc.perform(get("/api/doctors/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.name").value("Gregory House"))
                .andExpect(jsonPath("$.specialization").value("Diagnostic Medicine"));
    }

    @Test
    void testGetAllDoctors() throws Exception {
        List<Doctor> doctors = Collections.singletonList(testDoctor);
        when(doctorService.getAllDoctors()).thenReturn(doctors);

        mockMvc.perform(get("/api/doctors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(10L))
                .andExpect(jsonPath("$.data[0].name").value("Gregory House"));
    }

    @Test
    void testGetDoctorsPaginated() throws Exception {
        Page<Doctor> doctorPage = new PageImpl<>(Collections.singletonList(testDoctor));
        when(doctorRepository.findAll(any(Pageable.class))).thenReturn(doctorPage);

        mockMvc.perform(get("/api/doctors/paginated")
                        .param("page", "0")
                        .param("size", "10")
                        .param("sortBy", "name"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.doctors[0].id").value(10L))
                .andExpect(jsonPath("$.totalItems").value(1));
    }

    @Test
    void testGetDoctorById() throws Exception {
        when(doctorService.getDoctorById(10L)).thenReturn(testDoctor);

        mockMvc.perform(get("/api/doctors/{id}", 10L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.name").value("Gregory House"));
    }

    @Test
    void testGetBySpecialization() throws Exception {
        List<Doctor> doctors = Collections.singletonList(testDoctor);
        when(doctorService.getDoctorsBySpecialization("Diagnostic Medicine")).thenReturn(doctors);

        mockMvc.perform(get("/api/doctors/specialization/{spec}", "Diagnostic Medicine"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10L));
    }

    @Test
    void testGetAvailableDoctors() throws Exception {
        List<Doctor> doctors = Collections.singletonList(testDoctor);
        when(doctorService.getAvailableDoctors()).thenReturn(doctors);

        mockMvc.perform(get("/api/doctors/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10L))
                .andExpect(jsonPath("$[0].available").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testAddDoctorAdminSuccess() throws Exception {
        when(doctorService.saveDoctor(any(Doctor.class))).thenReturn(testDoctor);

        mockMvc.perform(post("/api/doctors")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testDoctor)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10L));
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void testAddDoctorNonAdminForbidden() throws Exception {
        mockMvc.perform(post("/api/doctors")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testDoctor)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateDoctorAdminSuccess() throws Exception {
        when(doctorService.updateDoctor(eq(10L), any(Doctor.class))).thenReturn(testDoctor);

        mockMvc.perform(put("/api/doctors/{id}", 10L)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testDoctor)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10L));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteDoctorAdminSuccess() throws Exception {
        doNothing().when(doctorService).deleteDoctor(10L);

        mockMvc.perform(delete("/api/doctors/{id}", 10L)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("Doctor deleted successfully!"));
    }
}
