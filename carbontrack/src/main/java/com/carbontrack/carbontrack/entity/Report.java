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
@Table(name = "reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id", nullable = false)
    @JsonIgnore
    private Organisation organisation;

    @Column(name = "report_type", nullable = false, length = 50)
    private String reportType; // DAILY, MONTHLY, YEARLY, DEPARTMENT, BRANCH, SCOPE, ESG, CSR

    @Column(name = "scope_filter", length = 20)
    private String scopeFilter;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "total_emission", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalEmission = BigDecimal.ZERO;

    @Column(name = "generated_date", insertable = false, updatable = false)
    private LocalDateTime generatedDate;

    @Column(name = "summary_json", columnDefinition = "TEXT")
    private String summaryJson;
}
