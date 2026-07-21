package com.carbontrack.carbontrack.repository;

import com.carbontrack.carbontrack.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByOrganisationId(Long orgId);
}
