package com.restaurante.service;

import com.restaurante.entity.Dish;
import com.restaurante.entity.Category;
import com.restaurante.repository.CategoryRepository;
import com.restaurante.repository.DishRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DishServiceTest {

    @Mock
    private DishRepository dishRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private DishService dishService;

    @BeforeEach
    void setUp() {
        // Setup mock data
    }

    @Test
    void search_shouldReturnDishesWithNameAndCategory() {
        UUID categoryId = UUID.randomUUID();
        Dish dish1 = new Dish();
        dish1.setId(UUID.randomUUID());
        dish1.setName("Risoto");
        dish1.setPrice(45.50);
        dish1.setCategoryId(categoryId);
        dish1.setActive(true);

        Dish dish2 = new Dish();
        dish2.setId(UUID.randomUUID());
        dish2.setName("Lasanha");
        dish2.setPrice(55.00);
        dish2.setCategoryId(categoryId);
        dish2.setActive(true);

        when(dishRepository.findByCategoryIdAndNameContainingIgnoreCaseAndActiveTrue(
                any(), anyString(), any()))
                .thenReturn(Arrays.asList(dish1, dish2));

        var result = dishService.search("Risoto", categoryId, null);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Risoto");
    }

    @Test
    void toggleActive_shouldInvertDishStatus() {
        UUID dishId = UUID.randomUUID();
        Dish dish = new Dish();
        dish.setId(dishId);
        dish.setName("Teste");
        dish.setActive(true);

        when(dishRepository.findById(dishId))
                .thenReturn(java.util.Optional.of(dish));
        when(dishRepository.save(any(Dish.class)))
                .thenReturn(dish);

        var result = dishService.toggleActive(dishId);

        assertThat(result.isActive()).isFalse();
    }

    @Test
    void create_shouldSaveDishWithCategory() {
        UUID categoryId = UUID.randomUUID();
        var request = new DishRequest();
        request.setName("Teste");
        request.setCategoryId(categoryId);
        request.setPrice(25.00);

        Category category = new Category();
        category.setId(categoryId);
        category.setName("Teste");

        when(categoryRepository.findById(categoryId))
                .thenReturn(java.util.Optional.of(category));

        when(dishRepository.save(any(Dish.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var result = dishService.create(request, null);

        assertThat(result.getName()).isEqualTo("Teste");
        assertThat(result.getCategory().getId()).isEqualTo(categoryId);
    }
}