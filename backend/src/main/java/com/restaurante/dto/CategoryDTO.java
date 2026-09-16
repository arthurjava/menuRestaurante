package com.restaurante.dto;

import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Data
public class CategoryDTO {
    private UUID id;
    private String name;
    private String description;
    private String imageUrl;
    private int displayOrder;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<DishDTO> dishes;
}