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
@Table(name = "assets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Asset {

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

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "asset_type", nullable = false, length = 50)
    private String assetType; // VEHICLE, GENERATOR, MACHINERY, HVAC, SOLAR_PANEL, SERVER

    @Column(name = "fuel_type", length = 50)
    private String fuelType;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "energy_consumption", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal energyConsumption = BigDecimal.ZERO;

    @Column(length = 50)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "emission_rating", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal emissionRating = BigDecimal.ZERO;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
