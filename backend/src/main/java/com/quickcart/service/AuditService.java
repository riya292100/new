package com.quickcart.service;

import com.quickcart.entity.AuditLog;
import com.quickcart.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    @Transactional
    public void logAction(String action, String entityName, String entityId, String performedBy, String ipAddress, String details) {
        log.info("AUDIT: action={}, entity={}[{}], user={}, ip={}", action, entityName, entityId, performedBy, ipAddress);

        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .entityName(entityName)
                .entityId(entityId)
                .performedBy(performedBy != null ? performedBy : "System")
                .ipAddress(ipAddress)
                .details(details)
                .build();

        auditLogRepository.save(auditLog);
    }

    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }

    public Page<AuditLog> getAuditLogsByEntity(String entityName, Pageable pageable) {
        return auditLogRepository.findByEntityName(entityName, pageable);
    }
}
