package com.restaurante.mapper;

import com.restaurante.entity.RestaurantSettings;
import com.restaurante.dto.RestaurantSettingsDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RestaurantSettingsMapper {
    RestaurantSettingsDTO toDTO(RestaurantSettings entity);
    RestaurantSettings toEntity(RestaurantSettingsDTO dto);
}