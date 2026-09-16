package com.restaurante.repository;

import com.restaurante.entity.Dish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DishRepository extends JpaRepository<Dish, UUID> {
    Optional<Dish> findByName(String name);
    Optional<Dish> findByCategoryAndActive(UUID categoryId, boolean active);
    java.util.List<Dish> findByActiveTrueOrderByDisplayOrderAsc();
}