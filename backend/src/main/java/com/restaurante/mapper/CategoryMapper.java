package com.restaurante.mapper;

import com.restaurante.dto.category.CategoryRequest;
import com.restaurante.dto.category.CategoryResponse;
import com.restaurante.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryMapper INSTANCE = Mappers.getMapper(CategoryMapper.class);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "dishes", ignore = true)
    @Mapping(target = "active", constant = "true")
    Category toEntity(CategoryRequest request);

    @Mapping(target = "dishCount", ignore = true)
    CategoryResponse toResponse(Category category);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "dishes", ignore = true)
    @Mapping(source = "request.name", target = "name")
    @Mapping(source = "request.description", target = "description")
    @Mapping(source = "request.imageUrl", target = "imageUrl")
    @Mapping(source = "request.displayOrder", target = "displayOrder")
    Category updateEntity(Category category, CategoryRequest request);
}