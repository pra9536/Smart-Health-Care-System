package com.smarthealthcare.service;


import com.smarthealthcare.dto.AppointmentRequest;
import com.smarthealthcare.entity.Appointment;
import com.smarthealthcare.entity.Doctor;
import com.smarthealthcare.entity.Patient;
import com.smarthealthcare.repository.AppointmentRepository;
import com.smarthealthcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    private final DoctorService doctorService;

    private final EmailService emailService;

    private final UserRepository userRepository;

    public Appointment bookAppointment(AppointmentRequest request, Patient patient){
        Doctor doctor = doctorService.getDoctorById(request.getDoctorId());

        Appointment appointment = new Appointment();

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setSymptoms(request.getSymtoms());
        appointment.setSymptoms(String.valueOf(Appointment.Status.PENDING));

        Appointment saved = appointmentRepository.save(appointment);

        try{
            String patientEmail = patient.getUser().getEmail();
            emailService.sendAppointmentConfirmation(
                    patientEmail,
                    patient.getName(),
                    doctor.getName(),
                    request.getAppointmentDate().toString(),
                    request.getAppointmentTime().toString()
            );
        } catch (Exception e) {
            System.out.println("Email failed: " + e.getMessage());
        }
        return saved;
    }

    public Appointment updateStatus(Long id, String status){
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setStatus(Appointment.Status.valueOf(status));

        Appointment updated = appointmentRepository.save(appointment);

        try{
            String patientEmail = appointment.getPatient()
                    .getUser()
                    .getEmail();
            emailService.sendStatusUpdate(
                    patientEmail,
                    appointment.getPatient().getName(),
                    appointment.getDoctor().getName(),
                    status,
                    appointment.getAppointmentDate().toString()
            );
        } catch (Exception e) {
            System.out.println("Email failed: " + e.getMessage());
        }

        return updated;
    }

    public List<Appointment> getAppointmentsByPatient(Patient patient){
        return appointmentRepository.findByPatient(patient);
    }

    public List<Appointment> getAppointmentsByDoctorId(Long doctorId) {
        Doctor doctor = doctorService.getDoctorById(doctorId);
        return appointmentRepository.findByDoctor(doctor);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
}
