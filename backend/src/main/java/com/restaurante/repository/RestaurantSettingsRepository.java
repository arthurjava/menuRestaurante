package com.restaurante.repository;

import com.restaurante.entity.RestaurantSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RestaurantSettingsRepository extends JpaRepository<RestaurantSettings, UUID> {
    Optional<RestaurantSettings> findFirstByOrderByCreatedAtAsc();
}