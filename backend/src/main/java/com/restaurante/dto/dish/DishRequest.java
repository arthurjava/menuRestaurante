package com.restaurante.dto.dish;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class DishRequest {
    @NotBlank
    @Size(max = 150)
    private String name;

    @Size(max = 5000)
    private String description;

    @NotNull
    @DecimalMin(value = "0.01", inclusive = true)
    @Digits(integer = 8, fraction = 2)
    private BigDecimal price;

    private UUID categoryId;

    private Integer prepTimeMinutes;

    @Min(0)
    private Integer calories;

    @Size(max = 500)
    private String allergens;

    private String imageUrl;
}