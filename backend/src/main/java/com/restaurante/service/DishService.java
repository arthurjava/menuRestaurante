package com.restaurante.service;

import com.restaurante.dto.dish.DishRequest;
import com.restaurante.dto.dish.DishResponse;
import com.restaurante.dto.common.PageResponse;
import com.restaurante.entity.Category;
import com.restaurante.entity.Dish;
import com.restaurante.entity.User;
import com.restaurante.exception.DuplicateResourceException;
import com.restaurante.exception.ResourceNotFoundException;
import com.restaurante.mapper.DishMapper;
import com.restaurante.repository.CategoryRepository;
import com.restaurante.repository.DishRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DishService {

    private final DishRepository dishRepository;
    private final CategoryRepository categoryRepository;
    private final DishMapper dishMapper;

    public DishResponse create(DishRequest request, User createdBy) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        if (dishRepository.existsByNameIgnoreCaseAndCategoryId(request.getName(), request.getCategoryId())) {
            throw new DuplicateResourceException("Dish", "name", request.getName());
        }

        Dish dish = dishMapper.toEntity(request);
        dish.setCategory(category);
        dish.setCreatedBy(createdBy);
        return dishMapper.toResponse(dishRepository.save(dish));
    }

    @Transactional(readOnly = true)
    public DishResponse getById(UUID id) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dish", "id", id));
        return dishMapper.toResponse(dish);
    }

    @Transactional(readOnly = true)
    public PageResponse<DishResponse> getAllActive(Pageable pageable) {
        Page<Dish> page = dishRepository.findByActiveTrueAndCategoryActiveTrue(pageable);
        return mapPage(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<DishResponse> getAllByCategory(UUID categoryId, Pageable pageable) {
        Page<Dish> page = dishRepository.findByCategoryIdAndActiveTrue(categoryId, pageable);
        return mapPage(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<DishResponse> search(String name, UUID categoryId, Boolean active, Pageable pageable) {
        Page<Dish> page;
        if (name != null && categoryId != null) {
            if (active != null && active) {
                page = dishRepository.findByCategoryIdAndNameContainingIgnoreCaseAndActiveTrue(categoryId, name, pageable);
            } else if (active != null && !active) {
                page = dishRepository.findByCategoryIdAndActiveFalseAndNameContainingIgnoreCase(categoryId, name, pageable);
            } else {
                page = dishRepository.findByCategoryIdAndNameContainingIgnoreCase(categoryId, name, pageable);
            }
        } else if (name != null) {
            if (active != null && active) {
                page = dishRepository.findByNameContainingIgnoreCaseAndActiveTrue(name, pageable);
            } else if (active != null && !active) {
                page = dishRepository.findByNameContainingIgnoreCaseAndActiveFalse(name, pageable);
            } else {
                page = dishRepository.findByNameContainingIgnoreCaseAndActiveTrue(name, pageable);
            }
        } else if (categoryId != null) {
            if (active != null && active) {
                page = dishRepository.findByCategoryIdAndActiveTrue(categoryId, pageable);
            } else if (active != null && !active) {
                page = dishRepository.findByCategoryIdAndActiveFalse(categoryId, pageable);
            } else {
                page = dishRepository.findByCategoryIdAndActiveTrue(categoryId, pageable);
            }
        } else {
            if (active != null && active) {
                page = dishRepository.findByActiveTrueAndCategoryActiveTrue(pageable);
            } else if (active != null && !active) {
                page = dishRepository.findByActiveFalseAndCategoryActiveFalse(pageable);
            } else {
                page = dishRepository.findByActiveTrueAndCategoryActiveTrue(pageable);
            }
        }
        return mapPage(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<DishResponse> getAllAdmin(Pageable pageable) {
        Page<Dish> page = dishRepository.findAll(pageable);
        return mapPage(page);
    }

    public DishResponse update(UUID id, DishRequest request) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dish", "id", id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        if (!dish.getName().equalsIgnoreCase(request.getName()) ||
                !dish.getCategory().getId().equals(request.getCategoryId())) {
            if (dishRepository.existsByNameIgnoreCaseAndCategoryId(request.getName(), request.getCategoryId())) {
                throw new DuplicateResourceException("Dish", "name", request.getName());
            }
        }

        dish.setCategory(category);
        dishMapper.updateEntity(dish, request);
        return dishMapper.toResponse(dishRepository.save(dish));
    }

    public DishResponse toggleActive(UUID id) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dish", "id", id));
        dish.setActive(!dish.isActive());
        return dishMapper.toResponse(dishRepository.save(dish));
    }

    public void delete(UUID id) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dish", "id", id));
        dishRepository.delete(dish);
    }

    private PageResponse<DishResponse> mapPage(Page<Dish> page) {
        return PageResponse.<DishResponse>builder()
                .content(page.getContent().stream().map(dishMapper::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .empty(page.isEmpty())
                .build();
    }
}