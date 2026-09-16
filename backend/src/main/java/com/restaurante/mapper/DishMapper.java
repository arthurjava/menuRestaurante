package com.restaurante.mapper;

import com.restaurante.entity.Dish;
import com.restaurante.dto.DishDTO;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(reportingPolicy = ReportingPolicy.NO_ERROR)
public interface DishMapper {
    DishDTO toDTO(Dish dish);
    Dish toEntity(DishDTO dishDTO);
}