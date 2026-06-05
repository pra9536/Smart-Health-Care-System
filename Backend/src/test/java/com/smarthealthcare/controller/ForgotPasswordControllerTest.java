package com.smarthealthcare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthealthcare.entity.User;
import com.smarthealthcare.repository.UserRepository;
import com.smarthealthcare.security.JwtUtil;
import com.smarthealthcare.security.CustomerUserDetailsService;
import com.smarthealthcare.security.JwtFilter;
import com.smarthealthcare.service.EmailService;
import com.smarthealthcare.config.SecurityConfig;
import org.springframework.context.annotation.Import;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ForgotPasswordController.class)
@Import({SecurityConfig.class, JwtFilter.class})
public class ForgotPasswordControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private EmailService emailService;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomerUserDetailsService customerUserDetailsService;


    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Jane Doe");
        testUser.setEmail("jane@example.com");
        testUser.setPassword("encodedOldPassword");
        testUser.setRole(User.Role.PATIENT);
        testUser.setVerified(true);
        testUser.setActive(true);
        testUser.setResetToken("valid-token");
        testUser.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
    }

    @Test
    void testForgotPasswordUserNotFoundReturnsFriendlySuccess() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "unknown@example.com");

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/forgot-password")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If this email exists, a reset link has been sent."));
    }

    @Test
    void testForgotPasswordUserFoundSendsEmail() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "jane@example.com");

        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(testUser));
        doNothing().when(emailService).sendHtmlEmail(anyString(), anyString(), anyString());

        mockMvc.perform(post("/api/auth/forgot-password")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password reset link sent to your email!"));
    }

    @Test
    void testVerifyResetTokenValid() throws Exception {
        when(userRepository.findByResetToken("valid-token")).thenReturn(Optional.of(testUser));

        mockMvc.perform(get("/api/auth/verify-reset-token")
                        .param("token", "valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.email").value("jane@example.com"));
    }

    @Test
    void testVerifyResetTokenExpired() throws Exception {
        testUser.setResetTokenExpiry(LocalDateTime.now().minusMinutes(5));
        when(userRepository.findByResetToken("valid-token")).thenReturn(Optional.of(testUser));

        mockMvc.perform(get("/api/auth/verify-reset-token")
                        .param("token", "valid-token"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.message").value("Invalid or expired reset link!"));
    }

    @Test
    void testResetPasswordSuccess() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("token", "valid-token");
        request.put("newPassword", "newSecuredPassword");

        when(userRepository.findByResetToken("valid-token")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("newSecuredPassword")).thenReturn("encodedNewPassword");

        mockMvc.perform(post("/api/auth/reset-password")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password reset successfully! You can now login with new password."));
    }
}
