package com.carbontrack.carbontrack.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "badges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "badge_name", nullable = false, unique = true, length = 100)
    private String badgeName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "badge_icon")
    private String badgeIcon;

    @Column(name = "required_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal requiredValue;

    @Column(length = 50)
    private String category;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
