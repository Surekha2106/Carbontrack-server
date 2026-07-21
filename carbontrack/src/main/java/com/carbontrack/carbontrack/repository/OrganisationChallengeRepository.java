package com.carbontrack.carbontrack.repository;

import com.carbontrack.carbontrack.entity.OrganisationChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrganisationChallengeRepository extends JpaRepository<OrganisationChallenge, Long> {
    List<OrganisationChallenge> findByOrganisationId(Long orgId);
}
