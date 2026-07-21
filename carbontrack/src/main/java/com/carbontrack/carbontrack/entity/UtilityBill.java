package com.carbontrack.carbontrack.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "utility_bills")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UtilityBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id", nullable = false)
    @JsonIgnore
    private Organisation organisation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    @JsonIgnore
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    @JsonIgnore
    private Department department;

    @Column(name = "bill_type", nullable = false, length = 50)
    private String billType; // ELECTRICITY, WATER, GAS, FUEL

    @Column(name = "account_number", length = 100)
    private String accountNumber;

    @Column(name = "billing_period", length = 50)
    private String billingPeriod;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "consumption_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal consumptionValue;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(length = 100)
    private String supplier;

    @Column(name = "emission_value", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal emissionValue = BigDecimal.ZERO;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
