package com.carbontrack.carbontrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganisationAdminDashboardDto {
    private String organisationName;
    private String logoUrl;
    private String primaryColor;
    private String allowedDomain;
    private int totalEmployees;
    private double totalEmissionsKg;
    private double averageEmissionsPerEmployeeKg;
    private Map<String, Double> emissionsByCategory;
    private List<MonthlyTrendDto> monthlyTrends;
    private List<EmployeeDetailDto> employeeDetails;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrendDto {
        private String month;
        private double emissionsKg;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeDetailDto {
        private Long id;
        private String name;
        private String email;
        private String department;
        private double emissionsKg;
        private int loggingStreak;
        private String goalStatus;
    }
}
