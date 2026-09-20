package com.restaurante.mapper;

import com.restaurante.entity.Dish;
import com.restaurante.dto.DishDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class, UserMapper.class, DishImageMapper.class})
public interface DishMapper {
    DishDTO toDTO(Dish dish);
    Dish toEntity(DishDTO dishDTO);
}