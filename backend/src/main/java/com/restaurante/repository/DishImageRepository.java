package com.restaurante.repository;

import com.restaurante.entity.DishImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DishImageRepository extends JpaRepository<DishImage, UUID> {
    List<DishImage> findByDishIdOrderByDisplayOrderAsc(UUID dishId);
    
    DishImage findByDishIdAndPrimaryTrue(UUID dishId);
}