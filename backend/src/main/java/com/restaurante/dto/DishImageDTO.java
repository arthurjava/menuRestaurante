package com.restaurante.dto;

import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Data
public class DishImageDTO {
    private UUID id;
    private String imageUrl;
    private boolean primary;
    private int displayOrder;
    private LocalDateTime createdAt;
}