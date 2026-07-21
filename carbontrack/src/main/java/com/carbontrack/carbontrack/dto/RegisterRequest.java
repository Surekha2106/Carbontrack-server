package com.carbontrack.carbontrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;

    // Account choice: "INDIVIDUAL" or "ORGANIZATION"
    private String accountType;

    // Organization specific details
    private String organisationName;
    private String industry;
    private String orgSize;
    private String country;
    private String state;
    private String city;
    private String address;
    private String gstNumber;
    private String website;
    private String contactNumber;
    private String orgEmail;
}
