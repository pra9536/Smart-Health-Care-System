package com.smarthealthcare.controller;

import com.smarthealthcare.entity.AuditLog;
import com.smarthealthcare.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:3001"})
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    // ===== GET ALL LOGS (ADMIN only) =====
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        return ResponseEntity.ok(
                auditLogRepository.findAll());
    }

    // ===== GET LOGS BY USER =====
    @GetMapping("/user/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getByUser(
            @PathVariable String email) {
        return ResponseEntity.ok(
                auditLogRepository.findByPerformedBy(email));
    }

    // ===== GET LOGS BY ACTION =====
    @GetMapping("/action/{action}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getByAction(
            @PathVariable String action) {
        return ResponseEntity.ok(
                auditLogRepository.findByAction(action));
    }
}