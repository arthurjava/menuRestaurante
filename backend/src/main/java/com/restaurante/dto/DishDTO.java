package com.restaurante.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DishDTO {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private boolean active;
    private Integer prepTimeMinutes;
    private Integer calories;
    private String allergens;
    private String imageUrl;
    private CategoryDTO category;
    private UserDTO createdBy;
    private List<DishImageDTO> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}