package com.carbontrack.carbontrack.repository;

import com.carbontrack.carbontrack.entity.EmployeeInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeInvitationRepository extends JpaRepository<EmployeeInvitation, UUID> {
    Optional<EmployeeInvitation> findByToken(String token);
    Optional<EmployeeInvitation> findByEmailAndOrganizationId(String email, Long organizationId);
}
