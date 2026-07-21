package com.carbontrack.carbontrack.dto;

import lombok.Data;

@Data
public class AcceptInviteRequest {
    private String token;
    private String fullName;
    private String password;
}
