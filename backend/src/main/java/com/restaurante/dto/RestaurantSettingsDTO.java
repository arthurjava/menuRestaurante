package com.restaurante.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class RestaurantSettingsDTO {
    private UUID id;
    private String name;
    private String tagline;
    private String description;
    private String logoUrl;
    private String coverUrl;
    private String businessHours;
    private String phone;
    private String email;
    private String address;
    private String website;
    private String instagram;
    private String facebook;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}