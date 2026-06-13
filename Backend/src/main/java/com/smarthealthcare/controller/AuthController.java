package com.smarthealthcare.controller;


import com.smarthealthcare.dto.LoginRequest;
import com.smarthealthcare.dto.RegisterRequest;
import com.smarthealthcare.entity.User;
import com.smarthealthcare.repository.UserRepository;
import com.smarthealthcare.security.JwtUtil;
import com.smarthealthcare.service.AuditService;
import com.smarthealthcare.service.OtpService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;
    private final AuditService auditService;

    @Value("${app.env:dev}")
    private String appEnv;


    // Step 1 - Register (sends OTP)
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {


        if(userRepository.existsByEmail(request.getEmail())) {
        User existing = userRepository.findByEmail(request.getEmail()).get();

        // if exists but not verified - resend OTP
        if (!existing.isVerified()) {
            otpService.sendOtp(existing);

            auditService.log("OTP_RESENT",
                    request.getEmail(),
                    "OTP resent to unverified user",
                    httpRequest.getRemoteAddr());

            return ResponseEntity.ok(Map.of(
                    "message", "OTP resent to your email",
                    "email", request.getEmail(),
                    "optSent", true
            ));

        }

        auditService.log(
                "REGISTER_FAILED",
                request.getEmail(),
                "Registration attempt with already existing email",
                httpRequest.getRemoteAddr()
        );

        return ResponseEntity.badRequest()
                .body(Map.of("message",
                        "Email already regisered!"));

    }

        // Create new user - NOT verified yet
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.valueOf(request.getRole().toUpperCase()));
        user.setVerified(false);

        userRepository.save(user);

        String debugOtp = otpService.sendOtp(user);

        auditService.log(
                "REGISTER",
                request.getEmail(),
                "New user registered with role: " + request.getRole(),
                httpRequest.getRemoteAddr()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("message", "OTP sent to " + request.getEmail() +
                ". Please verify to complete registration.");
        response.put("email", request.getEmail());
        response.put("otpSent", true);
        if ("dev".equalsIgnoreCase(appEnv)) {
            response.put("debugOtp", debugOtp);
        }

        return ResponseEntity.ok(response);
    }

    // Step 2 - Verify OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        String email = request.get("email");
        String otp = request.get("otp");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Already verified
        if(user.isVerified()) {
            return ResponseEntity.ok(Map.of(
                    "message", "Email already verified!",
                    "verified", true
            ));
        }

        // Verify OTP

        if(!otpService.verifyOtp(user, otp)) {

            auditService.log("OTP_FAILED",
                    email,
                    "Invalid or expired OTP entered",
                    httpRequest.getRemoteAddr());

            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid or expired OTP!",
                    "verified", false
            ));
        }

        // Mark as verified and clear OTP
        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        auditService.log(
                "EMAIL_VERIFIED",
                email,
                "User email verified successfully",
                httpRequest.getRemoteAddr()
        );

        return ResponseEntity.ok(Map.of(
                "message", "Email verified successfully! " +
                        "You can now login." ,
                "verified", true
        ));
    }

    // Resend OTP
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest
    ) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if(user.isVerified()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Email already verified!"
            ));
        }
        String debugOtp = otpService.sendOtp(user);

        auditService.log(
                "OTP_RESENT",
                email,
                "User manually requested OTP resend",
                httpRequest.getRemoteAddr()
        );
        Map<String, Object> response = new HashMap<>();
        response.put("message", "New OTP sent to " + email);
        if ("dev".equalsIgnoreCase(appEnv)) {
            response.put("debugOtp", debugOtp);
        }
        return ResponseEntity.ok(response);
    }


 // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if(user == null) {

            auditService.log(
                    "LOGIN_FAILED",
                    request.getEmail(),
                    "Login attempt with unknown email",
                    httpRequest.getRemoteAddr()
            );
            return ResponseEntity.status(401).body(Map.of(
                    "message", "Invalid email or password!"
            ));
        }

        if(!user.isVerified()) {
            String debugOtp = otpService.sendOtp(user);

            auditService.log(
                    "LOGIN_BLOCKED",
                    request.getEmail(),
                    "Login blocked - email not verified",
                    httpRequest.getRemoteAddr()
            );
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Email not verified! New OTP sent to your email.");
            response.put("notVerified", true);
            response.put("email", request.getEmail());
            if ("dev".equalsIgnoreCase(appEnv)) {
                response.put("debugOtp", debugOtp);
            }
            return ResponseEntity.status(403).body(response);
        }
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {

            auditService.log(
                    "LOGIN_FAILED",
                    request.getEmail(),
                    "Login failed - wrong password",
                    httpRequest.getRemoteAddr()
            );
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Invalid email or password!"));
        }

        String token = jwtUtil.generateToken(request.getEmail());

        auditService.log(
                "LOGIN_SUCCESS",
                user.getEmail(),
                "User logged in - role: " + user.getRole(),
                httpRequest.getRemoteAddr()
        );


        Map<String, Object> response = new HashMap<>();

        response.put("token", token);
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }
}
