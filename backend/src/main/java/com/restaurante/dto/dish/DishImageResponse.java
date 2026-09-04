package com.restaurante.dto.dish;

import com.restaurante.entity.DishImage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DishImageResponse {
    private UUID id;
    private UUID dishId;
    private String imageUrl;
    private boolean primary;
    private int displayOrder;
    private LocalDateTime createdAt;

    public static DishImageResponse from(DishImage image) {
        return DishImageResponse.builder()
                .id(image.getId())
                .dishId(image.getDish() != null ? image.getDish().getId() : null)
                .imageUrl(image.getImageUrl())
                .primary(image.isPrimary())
                .displayOrder(image.getDisplayOrder())
                .createdAt(image.getCreatedAt())
                .build();
    }
}