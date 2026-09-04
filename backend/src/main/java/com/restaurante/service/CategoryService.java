package com.restaurante.service;

import com.restaurante.dto.category.CategoryRequest;
import com.restaurante.dto.category.CategoryResponse;
import com.restaurante.dto.common.PageResponse;
import com.restaurante.entity.Category;
import com.restaurante.exception.DuplicateResourceException;
import com.restaurante.exception.ResourceNotFoundException;
import com.restaurante.mapper.CategoryMapper;
import com.restaurante.repository.CategoryRepository;
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
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Category", "name", request.getName());
        }
        Category category = categoryMapper.toEntity(request);
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional(readOnly = true)
    public CategoryResponse getById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return categoryMapper.toResponse(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllActive() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<CategoryResponse> getAll(Pageable pageable) {
        Page<Category> page = categoryRepository.findAll(pageable);
        return PageResponse.<CategoryResponse>builder()
                .content(page.getContent().stream().map(categoryMapper::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .empty(page.isEmpty())
                .build();
    }

    public CategoryResponse update(UUID id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (!category.getName().equalsIgnoreCase(request.getName()) &&
                categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Category", "name", request.getName());
        }

        categoryMapper.updateEntity(category, request);
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    public void delete(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(category);
    }

    public CategoryResponse toggleActive(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        category.setActive(!category.isActive());
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    public List<CategoryResponse> reorder(List<ReorderRequest> requests) {
        for (ReorderRequest req : requests) {
            Category category = categoryRepository.findById(req.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", req.getId()));
            category.setDisplayOrder(req.getDisplayOrder());
            categoryRepository.save(category);
        }
        return getAllActive();
    }

    public static class ReorderRequest {
        private UUID id;
        private int displayOrder;

        public ReorderRequest() {}

        public ReorderRequest(UUID id, int displayOrder) {
            this.id = id;
            this.displayOrder = displayOrder;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public int getDisplayOrder() { return displayOrder; }
        public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
    }
}