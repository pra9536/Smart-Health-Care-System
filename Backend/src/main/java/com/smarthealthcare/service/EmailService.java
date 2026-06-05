package com.smarthealthcare.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    // ===== Send simple plain text email =====
    public void sendSimpleEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    // ===== Send HTML email =====
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
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