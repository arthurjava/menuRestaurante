package com.restaurante.service;

import com.restaurante.entity.Dish;
import com.restaurante.entity.Category;
import com.restaurante.entity.User;
import com.restaurante.exception.ResourceNotFoundException;
import com.restaurante.repository.DishRepository;
import com.restaurante.repository.CategoryRepository;
import com.restaurante.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DishService {

    @Autowired
    private DishRepository dishRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    public Dish createDish(Dish dish) {
        if (dish.getCategory() != null) {
            Category category = categoryRepository.findById(dish.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
            dish.setCategory(category);
        }
        if (dish.getCreatedBy() != null) {
            User user = userRepository.findById(dish.getCreatedBy().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
            dish.setCreatedBy(user);
        }
        return dishRepository.save(dish);
    }

    public Dish findById(UUID id) {
        return dishRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Prato não encontrado"));
    }

    public List<Dish> findAllActive() {
        return dishRepository.findByActiveTrueOrderByNameAsc();
    }

    public List<Dish> findByCategory(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
        return dishRepository.findByCategoryIdAndActive(categoryId, true);
    }

    public List<Dish> findAllInactive() {
        return dishRepository.findByActiveFalse();
    }

    public Dish updateDish(UUID id, Dish dishDetails) {
        Dish dish = findById(id);
        dish.setName(dishDetails.getName());
        dish.setDescription(dishDetails.getDescription());
        dish.setPrice(dishDetails.getPrice());
        dish.setActive(dishDetails.isActive());
        dish.setPrepTimeMinutes(dishDetails.getPrepTimeMinutes());
        dish.setCalories(dishDetails.getCalories());
        dish.setAllergens(dishDetails.getAllergens());
        dish.setImageUrl(dishDetails.getImageUrl());
        if (dishDetails.getCategory() != null) {
            Category category = categoryRepository.findById(dishDetails.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
            dish.setCategory(category);
        }
        return dishRepository.save(dish);
    }

    public void deleteDish(UUID id) {
        dishRepository.deleteById(id);
    }
}