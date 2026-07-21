package com.carbontrack.carbontrack.controller;

import com.carbontrack.carbontrack.dto.OrganisationAdminDashboardDto;
import com.carbontrack.carbontrack.dto.OrganisationStatsDto;
import com.carbontrack.carbontrack.entity.*;
import com.carbontrack.carbontrack.dto.InviteEmployeeRequest;
import com.carbontrack.carbontrack.repository.*;
import com.carbontrack.carbontrack.service.AuditLogService;
import com.carbontrack.carbontrack.service.EmployeeInvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/organisation")
@RequiredArgsConstructor
public class OrganisationController {

    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final OrganisationInviteRepository inviteRepository;
    private final OrganisationGoalRepository goalRepository;
    private final OrganisationChallengeRepository challengeRepository;
    private final OrganisationRepository organisationRepository;
    private final BranchRepository branchRepository;
    private final DepartmentRepository departmentRepository;
    private final AssetRepository assetRepository;
    private final UtilityBillRepository utilityBillRepository;
    private final ReportRepository reportRepository;
    private final com.carbontrack.carbontrack.service.EmissionCalculationService emissionService;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeInvitationService employeeInvitationService;

    @PostMapping("/admin/invite")
    public ResponseEntity<?> sendInvitations(@RequestBody Map<String, List<String>> payload, Authentication authentication) {
        String adminEmail = authentication.getName();
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        if (admin == null || admin.getOrganisation() == null || admin.getRole() != Role.ORG_ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Only Organization Admins can send invitations."));
        }

        List<String> emails = payload.get("emails");
        if (emails == null || emails.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No emails provided."));
        }

        List<String> failedEmails = new ArrayList<>();
        int sent = 0;

        for (String email : emails) {
            try {
                employeeInvitationService.inviteEmployee(admin.getId(), admin.getOrganisation().getId(), email);
                sent++;
            } catch (Exception e) {
                failedEmails.add(email + " (" + e.getMessage() + ")");
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Invitations processed");
        response.put("sentCount", sent);
        response.put("failedEmails", failedEmails);
        
        auditLogService.log(admin.getOrganisation().getId(), admin.getEmail(), admin.getName(), "EMPLOYEE_INVITED", "Sent " + sent + " invitations. Failed: " + failedEmails.size());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<OrganisationStatsDto> getOrganisationDashboard(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (user.getOrganisation() == null) {
            user = autoAssignUserOrganisation(user);
        }

        if (user.getOrganisation() == null) {
            return ResponseEntity.ok(OrganisationStatsDto.builder()
                    .organisationName("Personal / No Org")
                    .totalEmployees(1)
                    .totalEmissionsKg(0.0)
                    .averageEmissionsPerEmployeeKg(0.0)
                    .topReducers(List.of())
                    .build());
        }

        Organisation org = user.getOrganisation();
        Long orgId = org.getId();
        List<User> employees = userRepository.findByOrganisationId(orgId);
        int totalEmployees = employees.size();

        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        java.math.BigDecimal totalEmissions = activityRepository.calculateOrgTotalEmissionsSince(orgId, thirtyDaysAgo);
        double totalEmissionsVal = totalEmissions == null ? 0.0 : totalEmissions.doubleValue();

        double averageEmissions = totalEmployees == 0 ? 0.0 : totalEmissionsVal / totalEmployees;

        List<Object[]> leaderboardData = activityRepository.getLeaderboardByOrganisation(orgId);
        List<OrganisationStatsDto.EmployeeStatDto> topReducers = leaderboardData.stream()
                .limit(3)
                .map(row -> new OrganisationStatsDto.EmployeeStatDto(
                        (String) row[0],
                        row[2] != null ? ((Number) row[2]).doubleValue() : 0.0
                ))
                .collect(Collectors.toList());

        java.math.BigDecimal s1 = activityRepository.calculateOrgScopeEmissionsSince(orgId, "SCOPE_1", thirtyDaysAgo);
        java.math.BigDecimal s2 = activityRepository.calculateOrgScopeEmissionsSince(orgId, "SCOPE_2", thirtyDaysAgo);
        java.math.BigDecimal s3 = activityRepository.calculateOrgScopeEmissionsSince(orgId, "SCOPE_3", thirtyDaysAgo);

        int branchCount = branchRepository.findByOrganisationId(orgId).size();
        int deptCount = departmentRepository.findByOrganisationId(orgId).size();

        OrganisationStatsDto stats = OrganisationStatsDto.builder()
                .organisationName(org.getName())
                .logoUrl(org.getLogoUrl())
                .primaryColor(org.getPrimaryColor() != null ? org.getPrimaryColor() : "#10B981")
                .allowedDomain(org.getAllowedDomain())
                .industry(org.getIndustry() != null ? org.getIndustry() : "Technology & Enterprise")
                .country(org.getCountry() != null ? org.getCountry() : "India")
                .totalEmployees(totalEmployees)
                .totalBranches(branchCount)
                .totalDepartments(deptCount)
                .totalEmissionsKg(totalEmissionsVal)
                .averageEmissionsPerEmployeeKg(averageEmissions)
                .scope1EmissionsKg(s1 != null ? s1.doubleValue() : 0.0)
                .scope2EmissionsKg(s2 != null ? s2.doubleValue() : 0.0)
                .scope3EmissionsKg(s3 != null ? s3.doubleValue() : 0.0)
                .topReducers(topReducers)
                .build();

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/admin/dashboard")
    public ResponseEntity<OrganisationAdminDashboardDto> getAdminDashboard(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.getRole() != Role.ORG_ADMIN || user.getOrganisation() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Organisation org = user.getOrganisation();
        Long orgId = org.getId();
        List<User> employees = userRepository.findByOrganisationId(orgId);
        int totalEmployees = employees.size();

        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        java.math.BigDecimal totalEmissions = activityRepository.calculateOrgTotalEmissionsSince(orgId, thirtyDaysAgo);
        double totalEmissionsVal = totalEmissions == null ? 0.0 : totalEmissions.doubleValue();
        double averageEmissions = totalEmployees == 0 ? 0.0 : totalEmissionsVal / totalEmployees;

        // Category breakdown
        List<Object[]> categoryBreakdownRaw = activityRepository.getOrgEmissionsByCategorySince(orgId, thirtyDaysAgo);
        Map<String, Double> categoryBreakdown = new HashMap<>();
        categoryBreakdown.put("Transport", 0.0);
        categoryBreakdown.put("Electricity", 0.0);
        categoryBreakdown.put("Food", 0.0);
        categoryBreakdown.put("Shopping", 0.0);

        for (Object[] row : categoryBreakdownRaw) {
            String cat = (String) row[0];
            Number em = (Number) row[1];
            if (cat != null) {
                categoryBreakdown.put(cat, em == null ? 0.0 : em.doubleValue());
            }
        }

        // Monthly trends
        LocalDate threeMonthsAgo = LocalDate.now().minusMonths(3);
        List<Object[]> dailyEmissions = activityRepository.getOrgDailyEmissionsSince(orgId, threeMonthsAgo);
        Map<String, Double> monthlyEmissionsMap = new LinkedHashMap<>();
        
        for (int i = 2; i >= 0; i--) {
            String monthName = LocalDate.now().minusMonths(i).getMonth().toString();
            monthlyEmissionsMap.put(monthName.substring(0, 3) + " " + LocalDate.now().minusMonths(i).getYear(), 0.0);
        }

        for (Object[] row : dailyEmissions) {
            LocalDate date = (LocalDate) row[0];
            Number em = (Number) row[1];
            if (date != null && em != null) {
                String monthKey = date.getMonth().toString().substring(0, 3) + " " + date.getYear();
                if (monthlyEmissionsMap.containsKey(monthKey)) {
                    monthlyEmissionsMap.put(monthKey, monthlyEmissionsMap.get(monthKey) + em.doubleValue());
                }
            }
        }

        List<OrganisationAdminDashboardDto.MonthlyTrendDto> monthlyTrends = monthlyEmissionsMap.entrySet().stream()
                .map(e -> new OrganisationAdminDashboardDto.MonthlyTrendDto(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        List<Object[]> leaderboardData = activityRepository.getLeaderboardByOrganisation(orgId);
        Map<String, Double> userEmissionsMap = leaderboardData.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[1],
                        row -> row[2] != null ? ((Number) row[2]).doubleValue() : 0.0,
                        (v1, v2) -> v1
                ));

        List<OrganisationAdminDashboardDto.EmployeeDetailDto> employeeDetails = employees.stream()
                .map(emp -> {
                    double em = userEmissionsMap.getOrDefault(emp.getEmail(), 0.0);
                    String status = "IN_PROGRESS";
                    if (em > 100) status = "MISSED";
                    else if (em > 0 && em <= 50) status = "ON_TRACK";
                    
                    return OrganisationAdminDashboardDto.EmployeeDetailDto.builder()
                            .id(emp.getId())
                            .name(emp.getName())
                            .email(emp.getEmail())
                            .department(emp.getDepartment() != null ? emp.getDepartment() : "General")
                            .emissionsKg(em)
                            .loggingStreak(emp.getCurrentStreak() != null ? emp.getCurrentStreak() : 0)
                            .goalStatus(status)
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(OrganisationAdminDashboardDto.builder()
                .organisationName(org.getName())
                .logoUrl(org.getLogoUrl())
                .primaryColor(org.getPrimaryColor() != null ? org.getPrimaryColor() : "#10B981")
                .allowedDomain(org.getAllowedDomain())
                .totalEmployees(totalEmployees)
                .totalEmissionsKg(totalEmissionsVal)
                .averageEmissionsPerEmployeeKg(averageEmissions)
                .emissionsByCategory(categoryBreakdown)
                .monthlyTrends(monthlyTrends)
                .employeeDetails(employeeDetails)
                .build());
    }

    // --- FEATURE 1: BULK EMPLOYEE ONBOARDING (HR CSV ROSTER) ---
    @PostMapping("/admin/bulk-onboard")
    public ResponseEntity<Map<String, Object>> bulkOnboardEmployees(
            @RequestBody Map<String, Object> payload, Authentication authentication) {
        String email = authentication.getName();
        User admin = userRepository.findByEmail(email).orElse(null);
        if (admin == null || admin.getRole() != Role.ORG_ADMIN || admin.getOrganisation() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Organisation org = admin.getOrganisation();
        List<Map<String, String>> employeesData = (List<Map<String, String>>) payload.get("employees");
        if (employeesData == null || employeesData.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Employees list is required"));
        }

        int createdCount = 0;
        int updatedCount = 0;

        for (Map<String, String> emp : employeesData) {
            String empEmail = emp.get("email");
            if (empEmail == null || empEmail.trim().isEmpty()) continue;
            empEmail = empEmail.trim().toLowerCase();

            String empName = emp.getOrDefault("name", empEmail.split("@")[0]);
            String dept = emp.getOrDefault("department", "General");

            Optional<User> existingUserOpt = userRepository.findByEmail(empEmail);
            if (existingUserOpt.isPresent()) {
                User existingUser = existingUserOpt.get();
                existingUser.setOrganisation(org);
                existingUser.setDepartment(dept);
                userRepository.save(existingUser);
                updatedCount++;
            } else {
                User newUser = User.builder()
                        .name(empName)
                        .email(empEmail)
                        .password(passwordEncoder.encode("Welcome123!"))
                        .role(Role.USER)
                        .department(dept)
                        .organisation(org)
                        .build();
                userRepository.save(newUser);
                createdCount++;
            }
        }

        String details = "Bulk onboarded " + (createdCount + updatedCount) + " employees (" + createdCount + " new accounts created, " + updatedCount + " updated).";
        auditLogService.log(org.getId(), admin.getEmail(), admin.getName(), "BULK_EMPLOYEE_ONBOARDING", details);

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "createdCount", createdCount,
                "updatedCount", updatedCount,
                "totalProcessed", createdCount + updatedCount,
                "message", details
        ));
    }

    // --- FEATURE 2: CUSTOM WHITE-LABELING & BRANDING ---
    @PutMapping("/admin/branding")
    public ResponseEntity<Organisation> updateBranding(
            @RequestBody Map<String, String> payload, Authentication authentication) {
        String email = authentication.getName();
        User admin = userRepository.findByEmail(email).orElse(null);
        if (admin == null || admin.getRole() != Role.ORG_ADMIN || admin.getOrganisation() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Organisation org = admin.getOrganisation();
        if (payload.containsKey("logoUrl")) org.setLogoUrl(payload.get("logoUrl"));
        if (payload.containsKey("primaryColor")) org.setPrimaryColor(payload.get("primaryColor"));
        if (payload.containsKey("allowedDomain")) org.setAllowedDomain(payload.get("allowedDomain"));

        Organisation savedOrg = organisationRepository.save(org);

        auditLogService.log(org.getId(), admin.getEmail(), admin.getName(), "BRANDING_UPDATED",
                "Updated custom branding: primaryColor=" + org.getPrimaryColor() + ", allowedDomain=" + org.getAllowedDomain());

        return ResponseEntity.ok(savedOrg);
    }

    // --- FEATURE 3: ACTIONABLE CARBON OFFSETTING & TREE MATH ---
    @GetMapping("/offset-analysis")
    public ResponseEntity<Map<String, Object>> getOffsetAnalysis(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.getOrganisation() == null) {
            return ResponseEntity.notFound().build();
        }

        Long orgId = user.getOrganisation().getId();
        java.math.BigDecimal totalEmissions = activityRepository.calculateOrgTotalEmissionsSince(orgId, LocalDate.now().minusDays(30));
        double totalEmissionsKg = totalEmissions == null ? 0.0 : totalEmissions.doubleValue();

        // Fetch target emission limit from goal or default target
        List<OrganisationGoal> goals = goalRepository.findByOrganisationId(orgId);
        double targetKg = goals.isEmpty() ? 5000.0 : goals.get(0).getTargetValue();
        double offsetGapKg = Math.max(0.0, totalEmissionsKg - targetKg);

        // Math: 1 tree absorbs ~20 kg CO2 / year; Certified offset cost ~ $15 per 1,000 kg CO2e
        int treesNeeded = (int) Math.ceil(offsetGapKg / 20.0);
        double donationCostUSD = Math.round((offsetGapKg / 1000.0) * 15.0 * 100.0) / 100.0;

        Map<String, Object> response = new HashMap<>();
        response.put("organisationName", user.getOrganisation().getName());
        response.put("totalEmissionsKg", totalEmissionsKg);
        response.put("targetEmissionsKg", targetKg);
        response.put("offsetGapKg", offsetGapKg);
        response.put("treesNeeded", treesNeeded);
        response.put("donationCostUSD", donationCostUSD);
        response.put("isCompliant", offsetGapKg == 0.0);
        response.put("recommendedProjects", List.of(
                Map.of("name", "Amazon Rainforest Reforestation", "costPerTree", 5.0, "provider", "Verra Certified"),
                Map.of("name", "Clean Solar Energy Grid Expansion", "costPerTon", 15.0, "provider", "Gold Standard"),
                Map.of("name", "Mangrove Wetland Restoration", "costPerTree", 4.0, "provider", "Plan Vivo")
        ));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/offset-action")
    public ResponseEntity<Map<String, Object>> executeOffsetAction(
            @RequestBody Map<String, Object> payload, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.getOrganisation() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String project = (String) payload.getOrDefault("project", "Certified Reforestation Project");
        Number trees = (Number) payload.getOrDefault("treesPlanted", 50);
        Number cost = (Number) payload.getOrDefault("amountPaidUSD", 250.0);

        String details = "Offset Action Executed: Planted " + trees + " trees via '" + project + "' (Total Contribution: $" + cost + ").";
        auditLogService.log(user.getOrganisation().getId(), user.getEmail(), user.getName(), "CARBON_OFFSET_PURCHASED", details);

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", details,
                "certificateId", "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()
        ));
    }

    // --- FEATURE 4: ADMIN AUDIT LOGS ---
    @GetMapping("/admin/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.getRole() != Role.ORG_ADMIN || user.getOrganisation() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(auditLogService.getLogsForOrg(user.getOrganisation().getId()));
    }

    // --- DEPARTMENT BATTLES (ENTERPRISE GAMIFICATION) ---
    @GetMapping("/department-battles")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentBattles(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.getOrganisation() == null) {
            return ResponseEntity.notFound().build();
        }

        List<Object[]> rawDepts = activityRepository.getDepartmentLeaderboardByOrganisation(user.getOrganisation().getId());
        List<Map<String, Object>> result = rawDepts.stream()
                .map(row -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("department", row[0] != null ? row[0] : "General");
                    m.put("totalEmissionsKg", row[1] != null ? ((Number) row[1]).doubleValue() : 0.0);
                    m.put("employeeCount", row[2] != null ? ((Number) row[2]).intValue() : 1);
                    double avg = m.get("employeeCount") != null && (int) m.get("employeeCount") > 0 ?
                            (double) m.get("totalEmissionsKg") / (int) m.get("employeeCount") : 0.0;
                    m.put("avgPerEmployeeKg", Math.round(avg * 10.0) / 10.0);
                    return m;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/goals")
    public ResponseEntity<List<OrganisationGoal>> getGoals(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null && user.getOrganisation() == null) {
            user = autoAssignUserOrganisation(user);
        }
        if (user == null || user.getOrganisation() == null) {
            return ResponseEntity.ok(List.of());
        }
        List<OrganisationGoal> goals = goalRepository.findByOrganisationId(user.getOrganisation().getId());
        if (goals.isEmpty()) {
            OrganisationGoal defaultGoal = OrganisationGoal.builder()
                    .organisation(user.getOrganisation())
                    .description("Quarterly Carbon Footprint Target")
                    .targetValue(5000.0)
                    .currentValue(0.0)
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().plusMonths(3))
                    .build();
            goalRepository.save(defaultGoal);
            goals = List.of(defaultGoal);
        }
        return ResponseEntity.ok(goals);
    }

    @PostMapping("/goals")
    public ResponseEntity<OrganisationGoal> setGoal(@RequestBody OrganisationGoal goal, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.getRole() != Role.ORG_ADMIN || user.getOrganisation() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        goal.setOrganisation(user.getOrganisation());
        if (goal.getStartDate() == null) goal.setStartDate(LocalDate.now());
        if (goal.getEndDate() == null) goal.setEndDate(LocalDate.now().plusMonths(3));
        
        java.math.BigDecimal total = activityRepository.calculateOrgTotalEmissionsSince(user.getOrganisation().getId(), goal.getStartDate());
        goal.setCurrentValue(total == null ? 0.0 : total.doubleValue());

        OrganisationGoal saved = goalRepository.save(goal);
        auditLogService.log(user.getOrganisation().getId(), user.getEmail(), user.getName(), "MANDATED_GOAL_CREATED",
                "Created mandated goal: '" + goal.getDescription() + "' with target limit " + goal.getTargetValue() + " kg CO2e");

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/challenges")
    public ResponseEntity<List<OrganisationChallenge>> getChallenges(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null && user.getOrganisation() == null) {
            user = autoAssignUserOrganisation(user);
        }
        if (user == null || user.getOrganisation() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(challengeRepository.findByOrganisationId(user.getOrganisation().getId()));
    }

    @PostMapping("/challenges")
    public ResponseEntity<OrganisationChallenge> createChallenge(@RequestBody OrganisationChallenge challenge, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.getRole() != Role.ORG_ADMIN || user.getOrganisation() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        challenge.setOrganisation(user.getOrganisation());
        if (challenge.getEndDate() == null) challenge.setEndDate(LocalDate.now().plusDays(30));

        List<User> employees = userRepository.findByOrganisationId(user.getOrganisation().getId());
        List<Object[]> leaderboardData = activityRepository.getLeaderboardByOrganisation(user.getOrganisation().getId());
        Map<String, Double> userEmissionsMap = leaderboardData.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[1],
                        row -> row[2] != null ? ((Number) row[2]).doubleValue() : 0.0,
                        (v1, v2) -> v1
                ));

        double sumA = 0.0;
        double sumB = 0.0;

        for (User emp : employees) {
            double em = userEmissionsMap.getOrDefault(emp.getEmail(), 0.0);
            if (emp.getDepartment() != null) {
                if (emp.getDepartment().equalsIgnoreCase(challenge.getDepartmentA())) {
                    sumA += em;
                } else if (emp.getDepartment().equalsIgnoreCase(challenge.getDepartmentB())) {
                    sumB += em;
                }
            }
        }

        challenge.setEmissionsA(sumA);
        challenge.setEmissionsB(sumB);

        OrganisationChallenge saved = challengeRepository.save(challenge);
        auditLogService.log(user.getOrganisation().getId(), user.getEmail(), user.getName(), "DEPARTMENT_CHALLENGE_CREATED",
                "Created challenge: " + challenge.getDepartmentA() + " vs " + challenge.getDepartmentB());

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> getOrgLeaderboard(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null && user.getOrganisation() == null) {
            user = autoAssignUserOrganisation(user);
        }
        if (user == null || user.getOrganisation() == null) {
            return ResponseEntity.ok(List.of());
        }

        List<Object[]> leaderboardData = activityRepository.getLeaderboardByOrganisation(user.getOrganisation().getId());
        List<Map<String, Object>> response = leaderboardData.stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", row[0]);
                    map.put("email", row[1]);
                    map.put("emissionsKg", row[2] != null ? ((Number) row[2]).doubleValue() : 0.0);
                    map.put("department", row.length > 3 ? row[3] : "General");
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    public User autoAssignUserOrganisation(User user) {
        if (user == null || user.getOrganisation() != null || user.getEmail() == null || !user.getEmail().contains("@")) {
            return user;
        }

        String email = user.getEmail().toLowerCase().trim();
        String domain = email.substring(email.indexOf("@") + 1);
        List<String> publicDomains = List.of("gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "live.com");
        if (publicDomains.contains(domain)) {
            return user;
        }

        // 1. Check direct invite
        Optional<OrganisationInvite> inviteOpt = inviteRepository.findByEmail(email);
        if (inviteOpt.isPresent()) {
            user.setOrganisation(inviteOpt.get().getOrganisation());
            return userRepository.save(user);
        }

        // 2. Find matching org by domain
        Optional<Organisation> orgOpt = organisationRepository.findByAllowedDomain(domain);
        if (orgOpt.isPresent()) {
            user.setOrganisation(orgOpt.get());
            return userRepository.save(user);
        }

        // 3. Find matching org by base name
        if (domain.contains(".")) {
            String baseName = Character.toUpperCase(domain.charAt(0)) + domain.substring(1, domain.indexOf('.'));
            Optional<Organisation> orgByName = organisationRepository.findByName(baseName);
            if (orgByName.isPresent()) {
                Organisation org = orgByName.get();
                if (org.getAllowedDomain() == null) {
                    org.setAllowedDomain(domain);
                    organisationRepository.save(org);
                }
                user.setOrganisation(org);
                return userRepository.save(user);
            }
        }

        return user;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerOrganisation(@RequestBody Map<String, String> payload, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }
        if (user.getOrganisation() != null) {
            return ResponseEntity.badRequest().body("User already belongs to an organisation");
        }

        String name = payload.get("name");
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Organisation name cannot be empty");
        }

        if (organisationRepository.existsByName(name.trim())) {
            return ResponseEntity.badRequest().body("Organisation with this name already exists");
        }

        String domain = payload.getOrDefault("allowedDomain", email.contains("@") ? email.substring(email.indexOf("@") + 1) : null);

        Organisation org = Organisation.builder()
                .name(name.trim())
                .adminUserId(user.getId())
                .allowedDomain(domain)
                .primaryColor("#10B981")
                .build();
        organisationRepository.save(org);

        user.setOrganisation(org);
        user.setRole(Role.ORG_ADMIN);
        userRepository.save(user);

        auditLogService.log(org.getId(), user.getEmail(), user.getName(), "ORGANISATION_REGISTERED",
                "Created organisation workspace: " + name);

        return ResponseEntity.ok(org);
    }

    @PostMapping("/claim-invite")
    public ResponseEntity<?> claimOrganisationInvite(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }
        if (user.getOrganisation() != null) {
            return ResponseEntity.badRequest().body("User already belongs to an organisation");
        }

        Optional<OrganisationInvite> inviteOpt = inviteRepository.findByEmail(email);
        if (inviteOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No pending invitation found for your email");
        }

        OrganisationInvite invite = inviteOpt.get();
        user.setOrganisation(invite.getOrganisation());
        user.setRole(Role.USER);
        userRepository.save(user);

        auditLogService.log(invite.getOrganisation().getId(), user.getEmail(), user.getName(), "EMPLOYEE_JOINED",
                "Joined organisation via claimed invitation");

        return ResponseEntity.ok(Map.of(
            "message", "Successfully joined " + invite.getOrganisation().getName(),
            "organisationName", invite.getOrganisation().getName()
        ));
    }

    // --- BRANCH MANAGEMENT ---
    @GetMapping("/branches")
    public ResponseEntity<List<Branch>> getBranches(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null || user.getOrganisation() == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(branchRepository.findByOrganisationId(user.getOrganisation().getId()));
    }

    @PostMapping("/branches")
    public ResponseEntity<Branch> createBranch(Authentication authentication, @RequestBody Map<String, String> payload) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null || user.getOrganisation() == null) return ResponseEntity.badRequest().build();
        Branch branch = Branch.builder()
                .organisation(user.getOrganisation())
                .name(payload.getOrDefault("name", "Main Branch"))
                .location(payload.getOrDefault("location", "Headquarters"))
                .code(payload.getOrDefault("code", "BR-01"))
                .headcount(Integer.parseInt(payload.getOrDefault("headcount", "10")))
                .build();
        return ResponseEntity.ok(branchRepository.save(branch));
    }

    // --- DEPARTMENT MANAGEMENT ---
    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getDepartments(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null || user.getOrganisation() == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(departmentRepository.findByOrganisationId(user.getOrganisation().getId()));
    }

    @PostMapping("/departments")
    public ResponseEntity<Department> createDepartment(Authentication authentication, @RequestBody Map<String, String> payload) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null || user.getOrganisation() == null) return ResponseEntity.badRequest().build();
        Branch branch = null;
        if (payload.containsKey("branchId") && payload.get("branchId") != null && !payload.get("branchId").isEmpty()) {
            branch = branchRepository.findById(Long.parseLong(payload.get("branchId"))).orElse(null);
        }
        Department dept = Department.builder()
                .organisation(user.getOrganisation())
                .branch(branch)
                .name(payload.getOrDefault("name", "Operations"))
                .code(payload.getOrDefault("code", "DEP-01"))
                .headcount(Integer.parseInt(payload.getOrDefault("headcount", "5")))
                .build();
        return ResponseEntity.ok(departmentRepository.save(dept));
    }

    // --- ASSET MANAGEMENT ---
    @GetMapping("/assets")
    public ResponseEntity<List<Asset>> getAssets(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null || user.getOrganisation() == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(assetRepository.findByOrganisationId(user.getOrganisation().getId()));
    }

    @PostMapping("/assets")
    public ResponseEntity<Asset> createAsset(Authentication authentication, @RequestBody Asset asset) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null || user.getOrganisation() == null) return ResponseEntity.badRequest().build();
        asset.setOrganisation(user.getOrganisation());
        return ResponseEntity.ok(assetRepository.save(asset));
    }

    // --- UTILITY BILL MODULE ---
    @GetMapping("/utility-bills")
    public ResponseEntity<List<UtilityBill>> getUtilityBills(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null || user.getOrganisation() == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(utilityBillRepository.findByOrganisationId(user.getOrganisation().getId()));
    }

    @PostMapping("/utility-bills")
    public ResponseEntity<UtilityBill> addUtilityBill(Authentication authentication, @RequestBody UtilityBill bill) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null || user.getOrganisation() == null) return ResponseEntity.badRequest().build();
        bill.setOrganisation(user.getOrganisation());
        if (bill.getLogDate() == null) bill.setLogDate(LocalDate.now());
        
        java.math.BigDecimal emission = emissionService.calculateEmission(bill.getBillType(), bill.getConsumptionValue());
        bill.setEmissionValue(emission);
        UtilityBill saved = utilityBillRepository.save(bill);

        String scope = emissionService.determineScope(bill.getBillType(), bill.getBillType());
        ActivityLog log = ActivityLog.builder()
                .user(user)
                .organisation(user.getOrganisation())
                .category("Utility Bill - " + bill.getBillType())
                .activityType(bill.getBillType())
                .quantity(bill.getConsumptionValue())
                .unit(bill.getUnit())
                .emission(emission)
                .scope(scope)
                .logDate(bill.getLogDate())
                .build();
        activityRepository.save(log);

        return ResponseEntity.ok(saved);
    }

    // --- REPORTS MANAGEMENT ---
    @GetMapping("/reports")
    public ResponseEntity<List<Report>> getReports(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null || user.getOrganisation() == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(reportRepository.findByOrganisationId(user.getOrganisation().getId()));
    }

    @PostMapping("/reports/generate")
    public ResponseEntity<Report> generateReport(Authentication authentication, @RequestBody Map<String, String> payload) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null || user.getOrganisation() == null) return ResponseEntity.badRequest().build();
        
        String reportType = payload.getOrDefault("reportType", "ESG_MONTHLY");
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        java.math.BigDecimal total = activityRepository.calculateOrgTotalEmissionsSince(user.getOrganisation().getId(), thirtyDaysAgo);

        Report report = Report.builder()
                .organisation(user.getOrganisation())
                .reportType(reportType)
                .scopeFilter(payload.getOrDefault("scopeFilter", "ALL"))
                .startDate(thirtyDaysAgo)
                .endDate(LocalDate.now())
                .totalEmission(total != null ? total : java.math.BigDecimal.ZERO)
                .summaryJson("{\"status\":\"APPROVED\",\"generatedBy\":\"" + user.getName() + "\",\"compliance\":\"GHG Protocol Standard\"}")
                .build();
        return ResponseEntity.ok(reportRepository.save(report));
    }
}
