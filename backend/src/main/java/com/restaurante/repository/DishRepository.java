package com.restaurante.repository;

import com.restaurante.entity.Dish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DishRepository extends JpaRepository<Dish, UUID> {
    Optional<Dish> findByName(String name);
    List<Dish> findByCategoryIdAndActive(UUID categoryId, boolean active);
    List<Dish> findByActiveFalse();
    List<Dish> findByActiveTrueOrderByNameAsc();
    List<Dish> findByNameContainingIgnoreCaseAndActiveTrue(String name);
}