package com.restaurante.controller;

import com.restaurante.dto.CategoryDTO;
import com.restaurante.entity.Category;
import com.restaurante.mapper.CategoryMapper;
import com.restaurante.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private CategoryMapper categoryMapper;

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> listar() {
        List<Category> categories = categoryService.findAllActive();
        List<CategoryDTO> dtos = categories.stream()
                .map(categoryMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<CategoryDTO>> listarAdmin() {
        List<Category> categories = categoryService.findAllActive();
        List<CategoryDTO> dtos = categories.stream()
                .map(categoryMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> buscarPorId(@PathVariable UUID id) {
        Category category = categoryService.findById(id);
        CategoryDTO dto = categoryMapper.toDTO(category);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<CategoryDTO> criar(@RequestBody CategoryDTO categoryDTO) {
        Category category = categoryMapper.toEntity(categoryDTO);
        Category created = categoryService.createCategory(category);
        return ResponseEntity.ok(categoryMapper.toDTO(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> atualizar(@PathVariable UUID id, @RequestBody CategoryDTO categoryDTO) {
        Category category = categoryMapper.toEntity(categoryDTO);
        category.setId(id);
        Category updated = categoryService.updateCategory(id, category);
        return ResponseEntity.ok(categoryMapper.toDTO(updated));
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<CategoryDTO> toggleActive(@PathVariable UUID id) {
        Category category = categoryService.findById(id);
        category.setActive(!category.isActive());
        Category updated = categoryService.updateCategory(id, category);
        return ResponseEntity.ok(categoryMapper.toDTO(updated));
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorder(@RequestBody java.util.List<UUID> ids) {
        // Reorder categories based on the provided IDs list
        int order = 0;
        for (UUID id : ids) {
            Category category = categoryService.findById(id);
            category.setDisplayOrder(order);
            categoryService.updateCategory(id, categoryMapper.toDTO(category));
            order++;
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        categoryService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}