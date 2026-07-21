package com.carbontrack.carbontrack.repository;

import com.carbontrack.carbontrack.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ActivityRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserIdOrderByLogDateDesc(Long userId);

    long countByUserId(Long userId);

    @Query("SELECT COALESCE(SUM(a.emission), 0) FROM ActivityLog a WHERE a.user.id = :userId")
    java.math.BigDecimal calculateTotalEmissions(@Param("userId") Long userId);

    @Query("SELECT a.category, COALESCE(SUM(a.emission), 0) FROM ActivityLog a WHERE a.user.id = :userId GROUP BY a.category")
    List<Object[]> getEmissionsByCategory(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(a.emission), 0) FROM ActivityLog a WHERE a.user.id = :userId AND (a.logDate IS NULL OR a.logDate >= :startDate)")
    java.math.BigDecimal calculateTotalEmissionsSince(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);

    @Query("SELECT COALESCE(SUM(a.emission), 0) FROM ActivityLog a WHERE a.user.id = :userId AND a.logDate >= :startDate AND a.logDate < :endDate")
    java.math.BigDecimal calculateTotalEmissionsBetween(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT a.category, COALESCE(SUM(a.emission), 0) FROM ActivityLog a WHERE a.user.id = :userId AND (a.logDate IS NULL OR a.logDate >= :startDate) GROUP BY a.category")
    List<Object[]> getEmissionsByCategorySince(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);

    @Query("SELECT a.activityType, COALESCE(SUM(a.emission), 0) as total FROM ActivityLog a WHERE a.user.id = :userId AND a.logDate >= :startDate GROUP BY a.activityType ORDER BY total DESC")
    List<Object[]> getTopEmissionActivitiesSince(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);

    @Query("SELECT a.logDate, COALESCE(SUM(a.emission), 0) FROM ActivityLog a WHERE a.user.id = :userId AND a.logDate >= :startDate GROUP BY a.logDate ORDER BY a.logDate ASC")
    List<Object[]> getDailyEmissionsSince(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);

    @Query("SELECT FUNCTION('DATE_TRUNC', 'week', a.logDate), COALESCE(SUM(a.emission), 0) FROM ActivityLog a WHERE a.user.id = :userId AND a.logDate >= :startDate GROUP BY FUNCTION('DATE_TRUNC', 'week', a.logDate) ORDER BY FUNCTION('DATE_TRUNC', 'week', a.logDate) ASC")
    List<Object[]> getWeeklyEmissionsSince(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);

    @Query("SELECT FUNCTION('DATE_TRUNC', 'month', a.logDate), COALESCE(SUM(a.emission), 0) FROM ActivityLog a WHERE a.user.id = :userId AND a.logDate >= :startDate GROUP BY FUNCTION('DATE_TRUNC', 'month', a.logDate) ORDER BY FUNCTION('DATE_TRUNC', 'month', a.logDate) ASC")
    List<Object[]> getMonthlyEmissionsSince(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);

    @Query("SELECT u.id, COALESCE(SUM(a.emission), 0) FROM User u LEFT JOIN ActivityLog a ON u.id = a.user.id AND a.logDate >= :startDate GROUP BY u.id")
    List<Object[]> getAllUsersEmissionsSince(@Param("startDate") LocalDate startDate);

    // Public / Personal User Leaderboard (Only users without an organisation)
    @Query("SELECT u.name, u.email, COALESCE(SUM(a.emission), 0) as total FROM User u LEFT JOIN ActivityLog a ON u.id = a.user.id WHERE u.organisation IS NULL GROUP BY u.name, u.email ORDER BY total ASC")
    List<Object[]> getGlobalLeaderboard();

    // Tenant Isolated Company Leaderboard (Only users within the given org_id)
    @Query("SELECT u.name, u.email, COALESCE(SUM(a.emission), 0) as total, u.department FROM User u LEFT JOIN ActivityLog a ON u.id = a.user.id WHERE u.organisation.id = :orgId GROUP BY u.name, u.email, u.department ORDER BY total ASC")
    List<Object[]> getLeaderboardByOrganisation(@Param("orgId") Long orgId);

    // Departmental Battle Leaderboard for Enterprise Gamification
    @Query("SELECT u.department, COALESCE(SUM(a.emission), 0) as total, COUNT(DISTINCT u.id) as userCount FROM User u LEFT JOIN ActivityLog a ON u.id = a.user.id WHERE u.organisation.id = :orgId GROUP BY u.department ORDER BY total ASC")
    List<Object[]> getDepartmentLeaderboardByOrganisation(@Param("orgId") Long orgId);

    @Query("SELECT COALESCE(SUM(a.emission), 0) FROM ActivityLog a WHERE a.user.organisation.id = :orgId AND a.logDate >= :startDate")
    java.math.BigDecimal calculateOrgTotalEmissionsSince(@Param("orgId") Long orgId, @Param("startDate") LocalDate startDate);

    @Query("SELECT COALESCE(SUM(a.emission), 0) FROM ActivityLog a WHERE a.user.organisation.id = :orgId AND a.scope = :scope AND a.logDate >= :startDate")
    java.math.BigDecimal calculateOrgScopeEmissionsSince(@Param("orgId") Long orgId, @Param("scope") String scope, @Param("startDate") LocalDate startDate);

    @Query("SELECT a.category, COALESCE(SUM(a.emission), 0) FROM ActivityLog a WHERE a.user.organisation.id = :orgId AND a.logDate >= :startDate GROUP BY a.category")
    List<Object[]> getOrgEmissionsByCategorySince(@Param("orgId") Long orgId, @Param("startDate") LocalDate startDate);

    @Query("SELECT a.logDate, COALESCE(SUM(a.emission), 0) FROM ActivityLog a WHERE a.user.organisation.id = :orgId AND a.logDate >= :startDate GROUP BY a.logDate ORDER BY a.logDate ASC")
    List<Object[]> getOrgDailyEmissionsSince(@Param("orgId") Long orgId, @Param("startDate") LocalDate startDate);
}
