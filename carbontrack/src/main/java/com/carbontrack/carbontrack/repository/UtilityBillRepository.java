package com.carbontrack.carbontrack.repository;

import com.carbontrack.carbontrack.entity.UtilityBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UtilityBillRepository extends JpaRepository<UtilityBill, Long> {
    List<UtilityBill> findByOrganisationId(Long orgId);
}
