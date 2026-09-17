package com.restaurante.mapper;

import com.restaurante.entity.Dish;
import com.restaurante.dto.DishDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DishMapper {
    DishDTO toDTO(Dish dish);
    Dish toEntity(DishDTO dishDTO);
}