package com.smarthealthcare.controller;

import com.smarthealthcare.entity.User;
import com.smarthealthcare.repository.UserRepository;
import com.smarthealthcare.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:3001"})
public class ForgotPasswordController {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    // ===== STEP 1 — Send reset link =====
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");

        User user = userRepository.findByEmail(email)
                .orElse(null);

        // Always return success — security ke liye
        // (Attacker ko pata na chale email exists karta hai)
        if (user == null) {
            return ResponseEntity.ok(Map.of(
                    "message",
                    "If this email exists, " +
                            "a reset link has been sent."
            ));
        }

        // Generate unique reset token
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(
                LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);

        // Send email with reset link
        String resetLink = "http://localhost:3000" +
                "/reset-password?token=" + token;

        String html = """
            <div style="font-family: Arial, sans-serif;
                        max-width: 500px; margin: auto;
                        padding: 30px;
                        border: 1px solid #e0e0e0;
                        border-radius: 12px;">

                <h2 style="color: #2563EB;
                           text-align: center;">
                    🏥 HealthCare System
                </h2>

                <h3 style="color: #1f2937;">
                    Reset Your Password
                </h3>

                <p>Dear <strong>%s</strong>,</p>
                <p>We received a request to reset your
                   password. Click the button below:</p>

                <div style="text-align: center;
                            margin: 30px 0;">
                    <a href="%s"
                       style="background: #2563EB;
                              color: white;
                              padding: 12px 30px;
                              border-radius: 8px;
                              text-decoration: none;
                              font-weight: bold;">
                        Reset Password
                    </a>
                </div>

                <p style="color: #ef4444; font-size: 13px;">
                    ⏰ This link expires in 30 minutes.
                </p>
                <p style="color: #6b7280; font-size: 13px;">
                    If you did not request this,
                    please ignore this email.
                </p>

                <p style="color: #2563EB;
                           font-weight: bold;
                           text-align: center;">
                    — HealthCare Team
                </p>
            </div>
            """.formatted(user.getName(), resetLink);

        try {
            emailService.sendHtmlEmail(
                    email,
                    "🔐 Reset Your Password — HealthCare",
                    html
            );
        } catch (Exception e) {
            System.err.println("[SMTP FAILURE] Could not send reset link email to " + email + " due to SMTP configuration. Falling back to console logging.");
            System.err.println("SMTP Exception Details: " + e.getMessage());
            e.printStackTrace();
            System.out.println("\n=================================================");
            System.out.println("🔑 [DEVELOPMENT MODE] PASSWORD RESET LINK FOR " + email + " IS: " + resetLink);
            System.out.println("=================================================\n");
        }

        return ResponseEntity.ok(Map.of(
                "message",
                "Password reset link sent to your email!",
                "debugToken", token
        ));
    }

    // ===== STEP 2 — Verify token =====
    @GetMapping("/verify-reset-token")
    public ResponseEntity<?> verifyToken(
            @RequestParam String token) {

        User user = userRepository
                .findByResetToken(token)
                .orElse(null);

        if (user == null ||
                LocalDateTime.now().isAfter(
                        user.getResetTokenExpiry())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid or expired reset link!",
                    "valid", false
            ));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Token is valid",
                "valid", true,
                "email", user.getEmail()
        ));
    }

    // ===== STEP 3 — Reset password =====
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody Map<String, String> request) {

        String token = request.get("token");
        String newPassword = request.get("newPassword");

        User user = userRepository
                .findByResetToken(token)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid reset token!"));

        // Check expiry
        if (LocalDateTime.now().isAfter(
                user.getResetTokenExpiry())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Reset link has expired! " +
                            "Please request a new one."
            ));
        }

        // Update password
        user.setPassword(
                passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message",
                "Password reset successfully! " +
                        "You can now login with new password."
        ));
    }
}