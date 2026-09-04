package com.restaurante.repository;

import com.restaurante.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findByActiveTrueOrderByDisplayOrderAsc();
    List<Category> findByActiveTrue();
    boolean existsByNameIgnoreCase(String name);
}