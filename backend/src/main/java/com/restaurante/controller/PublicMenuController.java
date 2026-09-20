package com.restaurante.controller;

import com.restaurante.dto.CategoryDTO;
import com.restaurante.dto.DishDTO;
import com.restaurante.entity.Dish;
import com.restaurante.mapper.CategoryMapper;
import com.restaurante.mapper.DishMapper;
import com.restaurante.service.CategoryService;
import com.restaurante.service.DishService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/menu")
public class PublicMenuController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private DishService dishService;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private DishMapper dishMapper;

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getPublicCategories() {
        List<CategoryDTO> categories = categoryService.findAllActive().stream()
                .map(categoryMapper::toDTO)
                .toList();
        return ResponseEntity.ok(categories);
    }

    @GetMapping
    public ResponseEntity<List<DishDTO>> getPublicMenu(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String search) {
        
        List<DishDTO> dishes;
        
        if (search != null && !search.trim().isEmpty()) {
            dishes = dishService.searchByName(search).stream()
                    .filter(Dish::isActive)
                    .map(dishMapper::toDTO)
                    .toList();
        } else if (categoryId != null) {
            dishes = dishService.findByCategory(categoryId).stream()
                    .filter(Dish::isActive)
                    .map(dishMapper::toDTO)
                    .toList();
        } else {
            dishes = dishService.findAllActive().stream()
                    .map(dishMapper::toDTO)
                    .toList();
        }
        
        return ResponseEntity.ok(dishes);
    }
}