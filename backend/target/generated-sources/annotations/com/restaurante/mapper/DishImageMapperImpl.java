package com.restaurante.mapper;

import com.restaurante.dto.DishImageDTO;
import com.restaurante.entity.DishImage;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-19T23:44:32+0000",
    comments = "version: 1.6.0, compiler: javac, environment: Java 25.0.4 (Eclipse Adoptium)"
)
@Component
public class DishImageMapperImpl implements DishImageMapper {

    @Override
    public DishImageDTO toDTO(DishImage dishImage) {
        if ( dishImage == null ) {
            return null;
        }

        DishImageDTO dishImageDTO = new DishImageDTO();

        dishImageDTO.setPrimary( dishImage.isPrimary() );
        dishImageDTO.setId( dishImage.getId() );
        dishImageDTO.setImageUrl( dishImage.getImageUrl() );
        dishImageDTO.setDisplayOrder( dishImage.getDisplayOrder() );
        dishImageDTO.setCreatedAt( dishImage.getCreatedAt() );

        return dishImageDTO;
    }

    @Override
    public DishImage toEntity(DishImageDTO dishImageDTO) {
        if ( dishImageDTO == null ) {
            return null;
        }

        DishImage.DishImageBuilder dishImage = DishImage.builder();

        dishImage.id( dishImageDTO.getId() );
        dishImage.imageUrl( dishImageDTO.getImageUrl() );
        dishImage.primary( dishImageDTO.isPrimary() );
        dishImage.displayOrder( dishImageDTO.getDisplayOrder() );
        dishImage.createdAt( dishImageDTO.getCreatedAt() );

        return dishImage.build();
    }
}
