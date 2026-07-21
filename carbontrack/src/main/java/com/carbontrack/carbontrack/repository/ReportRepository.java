package com.carbontrack.carbontrack.repository;

import com.carbontrack.carbontrack.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByOrganisationId(Long orgId);
}
