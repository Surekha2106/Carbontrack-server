package com.carbontrack.carbontrack.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "organisations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Organisation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "admin_user_id")
    private Long adminUserId;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "primary_color")
    @Builder.Default
    private String primaryColor = "#10B981";

    @Column(name = "allowed_domain")
    private String allowedDomain;

    @Column(name = "industry", length = 100)
    private String industry;

    @Column(name = "org_size", length = 50)
    private String orgSize;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "gst_number", length = 100)
    private String gstNumber;

    @Column(name = "website", length = 255)
    private String website;

    @Column(name = "contact_number", length = 50)
    private String contactNumber;

    @Column(name = "org_email", length = 100)
    private String orgEmail;

    @OneToMany(mappedBy = "organisation", cascade = CascadeType.ALL)
    private List<User> users;
}
