package com.restaurante.dto.dish;

import com.restaurante.entity.Dish;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DishResponse {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private boolean active;
    private Integer prepTimeMinutes;
    private Integer calories;
    private String allergens;
    private String imageUrl;
    private UUID categoryId;
    private String categoryName;
    private UUID createdBy;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<DishImageResponse> images;

    public static DishResponse from(Dish dish) {
        return DishResponse.builder()
                .id(dish.getId())
                .name(dish.getName())
                .description(dish.getDescription())
                .price(dish.getPrice())
                .active(dish.isActive())
                .prepTimeMinutes(dish.getPrepTimeMinutes())
                .calories(dish.getCalories())
                .allergens(dish.getAllergens())
                .imageUrl(dish.getImageUrl())
                .categoryId(dish.getCategory() != null ? dish.getCategory().getId() : null)
                .categoryName(dish.getCategory() != null ? dish.getCategory().getName() : null)
                .createdBy(dish.getCreatedBy() != null ? dish.getCreatedBy().getId() : null)
                .createdByName(dish.getCreatedBy() != null ? dish.getCreatedBy().getName() : null)
                .createdAt(dish.getCreatedAt())
                .updatedAt(dish.getUpdatedAt())
                .images(dish.getImages() != null ? dish.getImages().stream().map(DishImageResponse::from).toList() : List.of())
                .build();
    }
}