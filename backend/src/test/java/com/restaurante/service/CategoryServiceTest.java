package com.restaurante.service;

import com.restaurante.entity.Category;
import com.restaurante.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    @BeforeEach
    void setUp() {
        // Setup mock data
    }

    @Test
    void findByActiveTrueOrderByDisplayOrderAsc_shouldReturnActiveCategories() {
        Category category1 = new Category();
        category1.setId(UUID.randomUUID());
        category1.setName("Entradas");
        category1.setDisplayOrder(0);
        category1.setActive(true);

        Category category2 = new Category();
        category2.setId(UUID.randomUUID());
        category2.setName("Pratos Principais");
        category2.setDisplayOrder(1);
        category2.setActive(true);

        when(categoryRepository.findByActiveTrueOrderByDisplayOrderAsc())
                .thenReturn(Arrays.asList(category1, category2));

        var result = categoryService.getAllActive();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Entradas");
        assertThat(result.get(1).getName()).isEqualTo("Pratos Principais");
    }

    @Test
    void findById_shouldReturnCategoryWhenExists() {
        UUID categoryId = UUID.randomUUID();
        Category category = new Category();
        category.setId(categoryId);
        category.setName("Teste");

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        var result = categoryService.getById(categoryId);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Teste");
    }

    @Test
    void findById_shouldThrowWhenNotExists() {
        UUID categoryId = UUID.randomUUID();

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.empty());

        try {
            categoryService.getById(categoryId);
        } catch (ResponseStatusException e) {
            assertThat(e.getStatusCode().value()).isEqualTo(404);
        }
    }
}