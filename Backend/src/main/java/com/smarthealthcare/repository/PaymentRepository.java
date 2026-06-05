package com.smarthealthcare.repository;

import com.smarthealthcare.entity.Appointment;
import com.smarthealthcare.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByAppointment(Appointment appointment);
}
