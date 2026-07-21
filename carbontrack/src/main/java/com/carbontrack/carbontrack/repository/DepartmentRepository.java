package com.carbontrack.carbontrack.repository;

import com.carbontrack.carbontrack.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByOrganisationId(Long orgId);
    List<Department> findByBranchId(Long branchId);
}
