package com.restaurante.controller;

import com.restaurante.dto.category.CategoryResponse;
import com.restaurante.dto.dish.DishResponse;
import com.restaurante.dto.common.ApiResponse;
import com.restaurante.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<CategoryResponse, List<DishResponse>>>> getFullMenu() {
        return ResponseEntity.ok(ApiResponse.success(menuService.getFullMenu()));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(menuService.getCategoriesWithDishCount()));
    }

    @GetMapping("/categories/{categoryId}/dishes")
    public ResponseEntity<ApiResponse<List<DishResponse>>> getDishesByCategory(@PathVariable UUID categoryId) {
        return ResponseEntity.ok(ApiResponse.success(menuService.getDishesByCategory(categoryId)));
    }
}