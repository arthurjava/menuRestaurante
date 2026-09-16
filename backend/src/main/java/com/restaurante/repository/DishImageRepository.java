package com.restaurante.repository;

import com.restaurante.entity.DishImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DishImageRepository extends JpaRepository<DishImage, UUID> {
    Optional<DishImage> findByDishAndPrimary(UUID dishId, boolean primary);
}