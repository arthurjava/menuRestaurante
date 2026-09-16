package com.restaurante.mapper;

import com.restaurante.entity.Category;
import com.restaurante.dto.CategoryDTO;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(reportingPolicy = ReportingPolicy.NO_ERROR)
public interface CategoryMapper {
    CategoryDTO toDTO(Category category);
    Category toEntity(CategoryDTO categoryDTO);
}