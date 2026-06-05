package com.smarthealthcare.service;


import com.smarthealthcare.entity.AuditLog;
import com.smarthealthcare.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void log(String action, String performedBy,
                    String details, String ip) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setPerformedBy(performedBy);
        log.setDetails(details);
        log.setIpAddress(ip);
        auditLogRepository.save(log);
    }
}
