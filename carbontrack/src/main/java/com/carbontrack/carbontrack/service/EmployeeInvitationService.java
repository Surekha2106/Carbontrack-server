package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.entity.EmployeeInvitation;
import com.carbontrack.carbontrack.entity.InvitationStatus;
import com.carbontrack.carbontrack.entity.Organisation;
import com.carbontrack.carbontrack.repository.EmployeeInvitationRepository;
import com.carbontrack.carbontrack.repository.OrganisationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeInvitationService {

    private final EmployeeInvitationRepository invitationRepository;
    private final OrganisationRepository organisationRepository;
    private final EmailService emailService;

    @Transactional
    public void inviteEmployee(Long adminId, Long orgId, String employeeEmail) {
        Organisation org = organisationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        if (!org.getAdminUserId().equals(adminId)) {
            throw new RuntimeException("Unauthorized: Only the admin can invite employees");
        }

        // Check if pending invite already exists
        Optional<EmployeeInvitation> existing = invitationRepository.findByEmailAndOrganizationId(employeeEmail, orgId);
        if (existing.isPresent() && existing.get().getStatus() == InvitationStatus.PENDING && existing.get().getExpiresAt().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("A valid invitation has already been sent to this email.");
        }

        String token = UUID.randomUUID().toString();

        EmployeeInvitation invite = EmployeeInvitation.builder()
                .organizationId(orgId)
                .email(employeeEmail)
                .token(token)
                .status(InvitationStatus.PENDING)
                .build();

        invitationRepository.save(invite);

        String inviteLink = "http://localhost:5173/accept-invite?token=" + token;
        emailService.sendInviteEmail(employeeEmail, inviteLink, org.getName());
        
        log.info("Sent employee invitation to {}", employeeEmail);
    }
}
