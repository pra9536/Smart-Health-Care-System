package com.smarthealthcare.service;

import com.smarthealthcare.entity.User;
import com.smarthealthcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Value;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.env:dev}")
    private String appEnv;

    // ===== Generate 6 digit OTP =====
    public String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // 100000 to 999999
        return String.valueOf(otp);
    }

    // ===== Send OTP to email =====
    public String sendOtp(User user) {
        String otp = generateOtp();

        // Save OTP in database with 10 minute expiry
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Send email
        String subject = "🔐 Your OTP for HealthCare Registration";
        String html = """
            <div style="font-family: Arial, sans-serif;
                        max-width: 500px; margin: auto;
                        padding: 30px;
                        border: 1px solid #e0e0e0;
                        border-radius: 12px;">

                <h2 style="color: #2563EB; text-align: center;">
                    🏥 HealthCare System
                </h2>

                <h3 style="text-align: center; color: #1f2937;">
                    Verify Your Email
                </h3>

                <p>Dear <strong>%s</strong>,</p>
                <p>Thank you for registering! Use the OTP below
                   to complete your registration:</p>

                <div style="background: #EFF6FF;
                            border: 2px dashed #2563EB;
                            border-radius: 12px;
                            padding: 20px;
                            text-align: center;
                            margin: 25px 0;">
                    <p style="margin: 0; color: #6b7280;
                               font-size: 14px;">
                        Your One-Time Password
                    </p>
                    <h1 style="color: #2563EB;
                                font-size: 42px;
                                letter-spacing: 10px;
                                margin: 10px 0;">
                        %s
                    </h1>
                    <p style="margin: 0; color: #ef4444;
                               font-size: 12px;">
                        ⏰ Expires in 10 minutes
                    </p>
                </div>

                <p style="color: #6b7280; font-size: 13px;">
                    If you did not request this, please ignore
                    this email.
                </p>

                <p style="color: #2563EB; font-weight: bold;
                           text-align: center;">
                    — HealthCare Team
                </p>
            </div>
            """.formatted(user.getName(), otp);

        try {
            emailService.sendHtmlEmail(user.getEmail(), subject, html);
        } catch (Exception e) {
            System.err.println("[SMTP FAILURE] Could not send OTP email to " + user.getEmail() + " due to SMTP configuration.");
            if (!"dev".equalsIgnoreCase(appEnv)) {
                throw new RuntimeException("Failed to send verification email. Please check SMTP/Email configuration.", e);
            }
            System.err.println("SMTP Exception Details: " + e.getMessage());
            e.printStackTrace();
            System.out.println("\n=================================================");
            System.out.println("🔑 [DEVELOPMENT MODE] OTP FOR " + user.getEmail() + " IS: " + otp);
            System.out.println("=================================================\n");
        }
        return otp;
    }

    // ===== Verify OTP =====
    public boolean verifyOtp(User user, String inputOtp) {
        // Check if OTP matches
        if (!inputOtp.equals(user.getOtp())) {
            return false;
        }
        // Check if OTP is not expired
        if (LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            return false;
        }
        return true;
    }
}