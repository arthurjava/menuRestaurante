package com.restaurante.repository;

import com.restaurante.entity.Dish;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DishRepository extends JpaRepository<Dish, UUID> {
    Page<Dish> findByActiveTrueAndCategoryActiveTrue(Pageable pageable);
    
    Page<Dish> findByCategoryIdAndActiveTrue(UUID categoryId, Pageable pageable);
    
    Page<Dish> findByNameContainingIgnoreCaseAndActiveTrue(String name, Pageable pageable);
    
    Page<Dish> findByCategoryIdAndNameContainingIgnoreCaseAndActiveTrue(UUID categoryId, String name, Pageable pageable);
    
    List<Dish> findByCategoryIdAndActiveTrueOrderByDisplayOrderAsc(UUID categoryId);
    
    @Query("SELECT d FROM Dish d WHERE d.category.id = :categoryId AND d.active = true ORDER BY d.createdAt DESC")
    List<Dish> findRecentByCategory(UUID categoryId);
    
    boolean existsByNameIgnoreCaseAndCategoryId(String name, UUID categoryId);

    long countByCategoryIdAndActiveTrue(UUID categoryId);
}