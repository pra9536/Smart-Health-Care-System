package com.smarthealthcare.controller;

import com.smarthealthcare.config.SecurityConfig;
import com.smarthealthcare.entity.AuditLog;
import com.smarthealthcare.repository.AuditLogRepository;
import com.smarthealthcare.security.JwtFilter;
import com.smarthealthcare.security.JwtUtil;
import com.smarthealthcare.security.CustomerUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuditController.class)
@Import({SecurityConfig.class, JwtFilter.class})
public class AuditControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuditLogRepository auditLogRepository;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomerUserDetailsService customerUserDetailsService;

    private AuditLog testLog;

    @BeforeEach
    void setUp() {
        testLog = new AuditLog();
        testLog.setId(1L);
        testLog.setAction("LOGIN_SUCCESS");
        testLog.setPerformedBy("admin@example.com");
        testLog.setDetails("Admin successfully logged in");
        testLog.setIpAddress("127.0.0.1");
        testLog.setTimestamp(LocalDateTime.now());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllLogsAdminSuccess() throws Exception {
        List<AuditLog> list = Collections.singletonList(testLog);
        when(auditLogRepository.findAll()).thenReturn(list);

        mockMvc.perform(get("/api/audit/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].action").value("LOGIN_SUCCESS"));
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void testGetAllLogsDoctorForbidden() throws Exception {
        mockMvc.perform(get("/api/audit/all"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetByUserAdminSuccess() throws Exception {
        List<AuditLog> list = Collections.singletonList(testLog);
        when(auditLogRepository.findByPerformedBy("admin@example.com")).thenReturn(list);

        mockMvc.perform(get("/api/audit/user/{email}", "admin@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].performedBy").value("admin@example.com"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetByActionAdminSuccess() throws Exception {
        List<AuditLog> list = Collections.singletonList(testLog);
        when(auditLogRepository.findByAction("LOGIN_SUCCESS")).thenReturn(list);

        mockMvc.perform(get("/api/audit/action/{action}", "LOGIN_SUCCESS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].action").value("LOGIN_SUCCESS"));
    }
}
