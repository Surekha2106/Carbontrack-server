package com.carbontrack.carbontrack.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "organisation_challenges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganisationChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id", nullable = false)
    private Organisation organisation;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 255)
    private String description;

    @Column(name = "department_a", nullable = false, length = 50)
    private String departmentA;

    @Column(name = "department_b", nullable = false, length = 50)
    private String departmentB;

    @Column(name = "emissions_a", nullable = false)
    @Builder.Default
    private Double emissionsA = 0.0;

    @Column(name = "emissions_b", nullable = false)
    @Builder.Default
    private Double emissionsB = 0.0;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
}
