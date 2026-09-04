package com.restaurante.service;

import com.restaurante.dto.category.CategoryResponse;
import com.restaurante.dto.dish.DishResponse;
import com.restaurante.entity.Category;
import com.restaurante.entity.Dish;
import com.restaurante.mapper.CategoryMapper;
import com.restaurante.mapper.DishMapper;
import com.restaurante.repository.CategoryRepository;
import com.restaurante.repository.DishRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuService {

    private final CategoryRepository categoryRepository;
    private final DishRepository dishRepository;
    private final CategoryMapper categoryMapper;
    private final DishMapper dishMapper;

    public List<CategoryResponse> getCategoriesWithDishCount() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(category -> {
                    CategoryResponse response = categoryMapper.toResponse(category);
                    response.setDishCount(countActiveDishesByCategory(category.getId()));
                    return response;
                })
                .toList();
    }

    public Map<CategoryResponse, List<DishResponse>> getFullMenu() {
        List<Category> categories = categoryRepository.findByActiveTrueOrderByDisplayOrderAsc();
        List<Dish> allDishes = dishRepository.findByActiveTrueAndCategoryActiveTrue(
                org.springframework.data.domain.Pageable.unpaged()
        ).getContent();

        Map<UUID, List<Dish>> dishesByCategory = allDishes.stream()
                .collect(Collectors.groupingBy(d -> d.getCategory().getId()));

        return categories.stream()
                .collect(Collectors.toMap(
                        categoryMapper::toResponse,
                        category -> dishesByCategory.getOrDefault(category.getId(), List.of())
                                .stream()
                                .map(dishMapper::toResponse)
                                .toList()
                ));
    }

    public List<DishResponse> getDishesByCategory(UUID categoryId) {
        return dishRepository.findByCategoryIdAndActiveTrueOrderByDisplayOrderAsc(categoryId)
                .stream()
                .map(dishMapper::toResponse)
                .toList();
    }

    public long countActiveDishesByCategory(UUID categoryId) {
        return dishRepository.countByCategoryIdAndActiveTrue(categoryId);
    }
}