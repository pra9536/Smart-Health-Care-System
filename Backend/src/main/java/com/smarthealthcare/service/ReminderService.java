package com.smarthealthcare.service;

import com.smarthealthcare.entity.Appointment;
import com.smarthealthcare.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReminderService {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;

    // Runs every day at 9:00 AM
    @Scheduled(cron = "0 0 9 * * *")
    public void sendAppointmentReminders() {
        // Get tomorrow's date
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        // Find all confirmed appointments for tomorrow
        List<Appointment> appointments =
                appointmentRepository.findAll()
                        .stream()
                        .filter(a ->
                                a.getAppointmentDate().equals(tomorrow) &&
                                        a.getStatus() == Appointment.Status.CONFIRMED)
                        .toList();

        // Send reminder email to each patient
        for (Appointment apt : appointments) {
            try {
                String email = apt.getPatient()
                        .getUser().getEmail();
                String subject = "⏰ Appointment Reminder — Tomorrow!";
                String body = String.format("""
                    Dear %s,
                    
                    This is a reminder that you have an appointment
                    tomorrow!
                    
                    👨‍⚕️ Doctor     : Dr. %s
                    🏥 Specialty  : %s
                    📅 Date       : %s
                    ⏰ Time       : %s
                    
                    Please arrive 10 minutes early.
                    
                    — HealthCare Team
                    """,
                        apt.getPatient().getName(),
                        apt.getDoctor().getName(),
                        apt.getDoctor().getSpecialization(),
                        apt.getAppointmentDate(),
                        apt.getAppointmentTime()
                );

                emailService.sendSimpleEmail(email, subject, body);
                System.out.println("Reminder sent to: " + email);

            } catch (Exception e) {
                System.out.println("Reminder failed: " + e.getMessage());
            }
        }
    }
}