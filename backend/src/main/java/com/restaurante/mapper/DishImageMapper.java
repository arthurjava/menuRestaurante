package com.restaurante.mapper;

import com.restaurante.entity.DishImage;
import com.restaurante.dto.DishImageDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DishImageMapper {
    @Mapping(target = "primary", source = "primary")
    DishImageDTO toDTO(DishImage dishImage);
    DishImage toEntity(DishImageDTO dishImageDTO);
}