package com.smarthealthcare.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import jakarta.mail.internet.MimeMessage;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.mail.api-key:}")
    private String apiKey;

    @Value("${spring.mail.username}")
    private String senderEmail;

    // ===== Send simple plain text email =====
    public void sendSimpleEmail(String to, String subject, String body) {
        if (apiKey != null && !apiKey.trim().isEmpty()) {
            sendHtmlEmail(to, subject, body);
        } else {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        }
    }

    // ===== Send HTML email =====
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        if (apiKey != null && !apiKey.trim().isEmpty()) {
            // Send via Brevo HTTP API (Bypasses SMTP port blocking on Render)
            String url = "https://api.brevo.com/v3/smtp/email";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey.trim());

            Map<String, Object> request = Map.of(
                    "sender", Map.of("name", "Smart Health Care", "email", senderEmail),
                    "to", List.of(Map.of("email", to)),
                    "subject", subject,
                    "htmlContent", htmlBody
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            try {
                restTemplate.postForEntity(url, entity, String.class);
            } catch (Exception e) {
                throw new RuntimeException("Failed to send email via Brevo HTTP API: " + e.getMessage(), e);
            }
        } else {
            // Fallback to SMTP (Local environment)
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(htmlBody, true); // true = HTML
                mailSender.send(message);
            } catch (Exception e) {
                throw new RuntimeException("Failed to send email via SMTP: " + e.getMessage(), e);
            }
        }
    }

    // ===== Appointment booking confirmation email =====
    public void sendAppointmentConfirmation(
            String patientEmail,
            String patientName,
            String doctorName,
            String date,
            String time) {

        String subject = "✅ Appointment Booked — HealthCare";

        String html = """
            <div style="font-family: Arial, sans-serif; max-width: 600px;
                        margin: auto; padding: 20px;
                        border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2563EB;">🏥 HealthCare System</h2>
                <h3 style="color: #1f2937;">Appointment Confirmed!</h3>
                <p>Dear <strong>%s</strong>,</p>
                <p>Your appointment has been successfully booked.</p>
                <div style="background: #EFF6FF; padding: 15px;
                            border-radius: 8px; margin: 20px 0;">
                    <p>👨‍⚕️ <strong>Doctor:</strong> Dr. %s</p>
                    <p>📅 <strong>Date:</strong> %s</p>
                    <p>⏰ <strong>Time:</strong> %s</p>
                </div>
                <p style="color: #6b7280;">
                    Please arrive 10 minutes before your appointment.
                </p>
                <p style="color: #2563EB; font-weight: bold;">
                    — HealthCare Team
                </p>
            </div>
            """.formatted(patientName, doctorName, date, time);

        sendHtmlEmail(patientEmail, subject, html);
    }

    // ===== Appointment status update email =====
    public void sendStatusUpdate(
            String patientEmail,
            String patientName,
            String doctorName,
            String status,
            String date) {

        String subject = "📋 Appointment Update — HealthCare";

        String statusMsg = switch (status) {
            case "CONFIRMED" -> "✅ Your appointment has been CONFIRMED by the doctor.";
            case "CANCELLED" -> "❌ Your appointment has been CANCELLED.";
            case "COMPLETED" -> "✔️ Your appointment is marked as COMPLETED.";
            default -> "Your appointment status has been updated to: " + status;
        };

        String html = """
            <div style="font-family: Arial, sans-serif; max-width: 600px;
                        margin: auto; padding: 20px;
                        border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2563EB;">🏥 HealthCare System</h2>
                <p>Dear <strong>%s</strong>,</p>
                <p>%s</p>
                <div style="background: #EFF6FF; padding: 15px;
                            border-radius: 8px; margin: 20px 0;">
                    <p>👨‍⚕️ <strong>Doctor:</strong> Dr. %s</p>
                    <p>📅 <strong>Date:</strong> %s</p>
                </div>
                <p style="color: #2563EB; font-weight: bold;">
                    — HealthCare Team
                </p>
            </div>
            """.formatted(patientName, statusMsg, doctorName, date);

        sendHtmlEmail(patientEmail, subject, html);
    }
}