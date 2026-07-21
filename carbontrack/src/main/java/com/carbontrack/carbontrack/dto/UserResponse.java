package com.carbontrack.carbontrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String accountType; // "INDIVIDUAL" or "ORGANIZATION"
    private Long orgId;
    private String organisationName;
    private Long branchId;
    private String branchName;
    private Long departmentId;
    private String department;
    private String industry;
    private String country;
    private String logoUrl;
    private String primaryColor;
    private Integer currentStreak;
    private Integer highestStreak;
}
