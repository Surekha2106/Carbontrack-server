package com.carbontrack.carbontrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivityRequest {
    private String category;
    private String activityType;
    private BigDecimal quantity;
    private String unit;
    private LocalDate logDate;
}
