package com.smarthealthcare.controller;

import com.smarthealthcare.entity.Appointment;
import com.smarthealthcare.entity.Payment;
import com.smarthealthcare.repository.AppointmentRepository;
import com.smarthealthcare.repository.PaymentRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;

    @PostMapping("/process")
    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    public ResponseEntity<?> processPayment(@RequestBody PaymentRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Build simulated payment record
        Payment payment = new Payment();
        payment.setAppointment(appointment);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        
        // Generate high-end clinical Transaction ID (e.g. TXN_SHC_UUID)
        String txnId = "TXN_SHC_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        payment.setTransactionId(txnId);
        payment.setPaymentDate(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);

        // Update Appointment status to CONFIRMED on successful payment!
        appointment.setStatus(Appointment.Status.CONFIRMED);
        appointmentRepository.save(appointment);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getPaymentByAppointment(@PathVariable Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        Payment payment = paymentRepository.findByAppointment(appointment)
                .orElse(null);
        
        if (payment == null) {
            return ResponseEntity.ok().body(Map.of("message", "No payment details found for this appointment"));
        }
        
        return ResponseEntity.ok(payment);
    }

    @Data
    public static class PaymentRequest {
        private Long appointmentId;
        private Double amount;
        private String paymentMethod;
    }
}
