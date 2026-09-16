package com.restaurante.controller;

import com.restaurante.dto.DishDTO;
import com.restaurante.entity.Category;
import com.restaurante.entity.Dish;
import com.restaurante.entity.User;
import com.restaurante.mapper.DishMapper;
import com.restaurante.service.DishService;
import com.restaurante.service.DishImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dishes")
public class DishController {

    @Autowired
    private DishService dishService;

    @Autowired
    private DishMapper dishMapper;

    @Autowired
    private DishImageService dishImageService;

    @GetMapping
    public ResponseEntity<List<DishDTO>> listar(@RequestParam(required = false) UUID categoryId,
                                                 @RequestParam(required = false) Boolean active) {
        List<Dish> dishes;
        if (categoryId != null) {
            dishes = dishService.findByCategory(categoryId);
        } else if (active != null) {
            if (active) {
                dishes = dishService.findAllActive();
            } else {
                dishes = dishRepository.findByIsActiveFalse(); // need repo method
            }
        } else {
            dishes = dishService.findAllActive();
        }
        List<DishDTO> dtos = dishes.stream()
                .map(dishMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<DishDTO>> listarAdmin(@RequestParam(required = false) Boolean active) {
        List<Dish> dishes;
        if (active != null && !active) {
            // listings all dishes including inactive
        } else {
            dishes = dishService.findAllActive();
        }
        List<DishDTO> dtos = dishes.stream()
                .map(dishMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DishDTO> buscarPorId(@PathVariable UUID id) {
        Dish dish = dishService.findById(id);
        DishDTO dto = dishMapper.toDTO(dish);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<DishDTO> criar(@RequestBody DishDTO dishDTO) {
        Dish dish = dishMapper.toEntity(dishDTO);
        Dish created = dishService.createDish(dish);
        return ResponseEntity.ok(dishMapper.toDTO(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DishDTO> atualizar(@PathVariable UUID id, @RequestBody DishDTO dishDTO) {
        Dish dish = dishMapper.toEntity(dishDTO);
        dish.setId(id);
        Dish updated = dishService.updateDish(id, dish);
        return ResponseEntity.ok(dishMapper.toDTO(updated));
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<DishDTO> toggleActive(@PathVariable UUID id) {
        Dish dish = dishService.findById(id);
        dish.setActive(!dish.isActive());
        Dish updated = dishService.updateDish(id, dish);
        return ResponseEntity.ok(dishMapper.toDTO(updated));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<List<DishImageDTO>> uploadImages(@PathVariable UUID id,
                                                          @RequestParam("files") java.util.List<MultipartFile> files,
                                                          @RequestParam(defaultValue = "false") boolean replace) {
        List<DishImageDTO> images = dishImageService.uploadImages(id, files, replace);
        return ResponseEntity.ok(images);
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<Void> removerImagem(@PathVariable UUID id, @PathVariable UUID imageId) {
        dishImageService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/images/reorder")
    public ResponseEntity<Void> reorderImages(@PathVariable UUID id, @RequestBody java.util.List<UUID> imageIds) {
        // Reorder images based on provided IDs
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        dishService.deleteDish(id);
        return ResponseEntity.noContent().build();
    }
}