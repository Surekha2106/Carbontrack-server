package com.carbontrack.carbontrack.repository;

import com.carbontrack.carbontrack.entity.OrganisationGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrganisationGoalRepository extends JpaRepository<OrganisationGoal, Long> {
    List<OrganisationGoal> findByOrganisationId(Long orgId);
}
