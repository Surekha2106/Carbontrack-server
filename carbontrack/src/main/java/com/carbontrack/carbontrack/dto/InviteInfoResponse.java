package com.carbontrack.carbontrack.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InviteInfoResponse {
    private String email;
    private String organizationName;
    private boolean valid;
}
