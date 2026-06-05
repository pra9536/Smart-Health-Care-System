package com.smarthealthcare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthealthcare.dto.LoginRequest;
import com.smarthealthcare.dto.RegisterRequest;
import com.smarthealthcare.entity.User;
import com.smarthealthcare.repository.UserRepository;
import com.smarthealthcare.security.JwtUtil;
import com.smarthealthcare.security.CustomerUserDetailsService;
import com.smarthealthcare.security.JwtFilter;
import com.smarthealthcare.service.AuditService;
import com.smarthealthcare.service.OtpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.smarthealthcare.config.SecurityConfig;
import org.springframework.context.annotation.Import;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtFilter.class})
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private OtpService otpService;

    @MockitoBean
    private AuditService auditService;

    @MockitoBean
    private CustomerUserDetailsService customerUserDetailsService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("John Doe");
        testUser.setEmail("john@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setRole(User.Role.PATIENT);
        testUser.setVerified(false);
        testUser.setActive(true);
    }

    @Test
    void testRegisterNewUserSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("John Doe");
        request.setEmail("john@example.com");
        request.setPassword("password");
        request.setRole("PATIENT");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.otpSent").value(true))
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    @Test
    void testRegisterExistingUnverifiedUserResendsOtp() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("John Doe");
        request.setEmail("john@example.com");
        request.setPassword("password");
        request.setRole("PATIENT");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("OTP resent to your email"))
                .andExpect(jsonPath("$.optSent").value(true));
    }

    @Test
    void testRegisterExistingVerifiedUserFails() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("John Doe");
        request.setEmail("john@example.com");
        request.setPassword("password");
        request.setRole("PATIENT");

        testUser.setVerified(true);
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email already regisered!"));
    }

    @Test
    void testVerifyOtpSuccess() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "john@example.com");
        request.put("otp", "123456");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(otpService.verifyOtp(any(User.class), eq("123456"))).thenReturn(true);

        mockMvc.perform(post("/api/auth/verify-otp")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(true))
                .andExpect(jsonPath("$.message").value("Email verified successfully! You can now login."));
    }

    @Test
    void testVerifyOtpInvalidOtp() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "john@example.com");
        request.put("otp", "wrong_otp");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(otpService.verifyOtp(any(User.class), eq("wrong_otp"))).thenReturn(false);

        mockMvc.perform(post("/api/auth/verify-otp")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.verified").value(false))
                .andExpect(jsonPath("$.message").value("Invalid or expired OTP!"));
    }

    @Test
    void testLoginSuccess() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("password");

        testUser.setVerified(true);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(jwtUtil.generateToken("john@example.com")).thenReturn("testToken");

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("testToken"))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.role").value("PATIENT"));
    }

    @Test
    void testLoginUnverifiedUserBlockAndResend() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("password");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.notVerified").value(true))
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    @Test
    void testLoginWrongPassword() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("wrong_password");

        testUser.setVerified(true);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password!"));
    }
}
