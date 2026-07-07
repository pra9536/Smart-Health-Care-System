package com.smarthealthcare.controller;

import com.smarthealthcare.entity.Appointment;
import com.smarthealthcare.entity.Payment;
import com.smarthealthcare.repository.AppointmentRepository;
import com.smarthealthcare.repository.PaymentRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
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

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;


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

    @PostMapping("/create-order")
    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Long> request) {
        Long appointmentId = request.get("appointmentId");
        if (appointmentId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Appointment ID is required"));
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        try {
            Double amount = appointment.getDoctor().getConsultationFee();
            if (amount == null) {
                amount = 500.0;
            }

            int amountInPaise = (int) (amount * 100);

            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_appt_" + appointmentId);

            Order order = razorpay.orders.create(orderRequest);
            String orderId = order.get("id");

            Payment payment = paymentRepository.findByAppointment(appointment)
                    .orElse(new Payment());
            payment.setAppointment(appointment);
            payment.setAmount(amount);
            payment.setPaymentMethod("RAZORPAY");
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setTransactionId(orderId);
            payment.setPaymentDate(LocalDateTime.now());

            paymentRepository.save(payment);

            return ResponseEntity.ok(Map.of(
                    "orderId", orderId,
                    "amount", amountInPaise,
                    "currency", "INR",
                    "keyId", razorpayKeyId
            ));
        } catch (RazorpayException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Razorpay order creation failed: " + e.getMessage()));
        }
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> request) {
        Long appointmentId = Long.valueOf(request.get("appointmentId").toString());
        String razorpayPaymentId = (String) request.get("razorpayPaymentId");
        String razorpayOrderId = (String) request.get("razorpayOrderId");
        String razorpaySignature = (String) request.get("razorpaySignature");

        if (appointmentId == null || razorpayPaymentId == null || razorpayOrderId == null || razorpaySignature == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required verification parameters"));
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (isValid) {
                Payment payment = paymentRepository.findByAppointment(appointment)
                        .orElseThrow(() -> new RuntimeException("Payment record not found"));

                payment.setStatus(Payment.PaymentStatus.SUCCESS);
                payment.setTransactionId(razorpayPaymentId);
                payment.setPaymentDate(LocalDateTime.now());
                paymentRepository.save(payment);

                appointment.setStatus(Appointment.Status.CONFIRMED);
                appointmentRepository.save(appointment);

                return ResponseEntity.ok(Map.of(
                        "status", "SUCCESS",
                        "message", "Payment verified and appointment confirmed",
                        "payment", payment
                ));
            } else {
                Payment payment = paymentRepository.findByAppointment(appointment).orElse(null);
                if (payment != null) {
                    payment.setStatus(Payment.PaymentStatus.FAILED);
                    paymentRepository.save(payment);
                }
                return ResponseEntity.badRequest().body(Map.of(
                        "status", "FAILED",
                        "message", "Invalid signature"
                ));
            }
        } catch (RazorpayException e) {
            Payment payment = paymentRepository.findByAppointment(appointment).orElse(null);
            if (payment != null) {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                paymentRepository.save(payment);
            }
            return ResponseEntity.status(500).body(Map.of(
                    "status", "ERROR",
                    "message", "Signature verification error: " + e.getMessage()
            ));
        }
    }

    @Data
    public static class PaymentRequest {
        private Long appointmentId;
        private Double amount;
        private String paymentMethod;
    }
}
