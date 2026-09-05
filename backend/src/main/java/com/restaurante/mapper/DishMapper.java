package com.restaurante.mapper;

import com.restaurante.dto.dish.DishImageResponse;
import com.restaurante.dto.dish.DishRequest;
import com.restaurante.dto.dish.DishResponse;
import com.restaurante.entity.Dish;
import com.restaurante.entity.DishImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface DishMapper {

    DishMapper INSTANCE = Mappers.getMapper(DishMapper.class);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "active", constant = "true")
    Dish toEntity(DishRequest request);

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "createdBy", source = "createdBy.id")
    @Mapping(target = "createdByName", source = "createdBy.name")
    DishResponse toResponse(Dish dish);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(source = "request.name", target = "name")
    @Mapping(source = "request.description", target = "description")
    @Mapping(source = "request.price", target = "price")
    @Mapping(source = "request.prepTimeMinutes", target = "prepTimeMinutes")
    @Mapping(source = "request.calories", target = "calories")
    @Mapping(source = "request.allergens", target = "allergens")
    @Mapping(source = "request.imageUrl", target = "imageUrl")
    @Mapping(source = "request.displayOrder", target = "displayOrder")
    Dish updateEntity(Dish dish, DishRequest request);

    @Mapping(target = "dishId", source = "dish.id")
    DishImageResponse toImageResponse(DishImage image);
}