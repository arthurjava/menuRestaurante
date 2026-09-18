package com.restaurante.mapper;

import com.restaurante.entity.Category;
import com.restaurante.dto.CategoryDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    @Mapping(target = "dishes", ignore = true)
    CategoryDTO toDTO(Category category);
    Category toEntity(CategoryDTO categoryDTO);
}