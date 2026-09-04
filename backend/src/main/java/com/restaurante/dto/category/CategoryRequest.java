package com.restaurante.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 1000)
    private String description;

    private String imageUrl;

    private int displayOrder = 0;
}