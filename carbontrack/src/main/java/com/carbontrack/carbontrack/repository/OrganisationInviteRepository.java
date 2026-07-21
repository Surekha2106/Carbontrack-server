package com.carbontrack.carbontrack.repository;

import com.carbontrack.carbontrack.entity.OrganisationInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OrganisationInviteRepository extends JpaRepository<OrganisationInvite, Long> {
    Optional<OrganisationInvite> findByEmail(String email);
    boolean existsByEmail(String email);
}
