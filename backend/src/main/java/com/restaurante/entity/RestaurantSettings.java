package com.restaurante.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "restaurant_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 200)
    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "cover_url", length = 500)
    private String coverUrl;

    @Column(name = "business_hours", columnDefinition = "JSONB")
    @JdbcTypeCode(SqlTypes.JSON)
    private String businessHours;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 200)
    private String address;

    @Column(length = 100)
    private String website;

    @Column(length = 50)
    private String instagram;

    @Column(length = 100)
    private String facebook;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}