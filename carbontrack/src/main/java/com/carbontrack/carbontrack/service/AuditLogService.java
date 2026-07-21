package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.entity.AuditLog;
import com.carbontrack.carbontrack.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(Long orgId, String actorEmail, String actorName, String action, String details) {
        AuditLog auditLog = AuditLog.builder()
                .orgId(orgId)
                .actorEmail(actorEmail)
                .actorName(actorName)
                .action(action)
                .details(details)
                .createdAt(LocalDateTime.now())
                .build();
        auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getLogsForOrg(Long orgId) {
        return auditLogRepository.findByOrgIdOrderByCreatedAtDesc(orgId);
    }
}
