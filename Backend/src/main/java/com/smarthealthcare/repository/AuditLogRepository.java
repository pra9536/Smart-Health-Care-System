package com.smarthealthcare.repository;

import com.smarthealthcare.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // Find logs by user email
    List<AuditLog> findByPerformedBy(String email);

    // Find logs by action type
    List<AuditLog> findByAction(String action);

    // Find logs by IP address
    List<AuditLog> findByIpAddress(String ipAddress);
}
