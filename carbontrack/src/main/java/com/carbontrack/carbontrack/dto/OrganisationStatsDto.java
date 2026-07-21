package com.carbontrack.carbontrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganisationStatsDto {
    private String organisationName;
    private String logoUrl;
    private String primaryColor;
    private String allowedDomain;
    private String industry;
    private String country;
    private int totalEmployees;
    private int totalBranches;
    private int totalDepartments;
    private double totalEmissionsKg;
    private double averageEmissionsPerEmployeeKg;
    
    // GHG Protocol Scopes
    private double scope1EmissionsKg;
    private double scope2EmissionsKg;
    private double scope3EmissionsKg;

    private List<EmployeeStatDto> topReducers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeStatDto {
        private String name;
        private double emissionsKg;
    }
}
