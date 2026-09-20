package com.restaurante.mapper;

import com.restaurante.dto.DishDTO;
import com.restaurante.dto.DishImageDTO;
import com.restaurante.entity.Dish;
import com.restaurante.entity.DishImage;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-19T23:44:33+0000",
    comments = "version: 1.6.0, compiler: javac, environment: Java 25.0.4 (Eclipse Adoptium)"
)
@Component
public class DishMapperImpl implements DishMapper {

    @Autowired
    private CategoryMapper categoryMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private DishImageMapper dishImageMapper;

    @Override
    public DishDTO toDTO(Dish dish) {
        if ( dish == null ) {
            return null;
        }

        DishDTO dishDTO = new DishDTO();

        dishDTO.setId( dish.getId() );
        dishDTO.setName( dish.getName() );
        dishDTO.setDescription( dish.getDescription() );
        dishDTO.setPrice( dish.getPrice() );
        dishDTO.setActive( dish.isActive() );
        dishDTO.setPrepTimeMinutes( dish.getPrepTimeMinutes() );
        dishDTO.setCalories( dish.getCalories() );
        dishDTO.setAllergens( dish.getAllergens() );
        dishDTO.setImageUrl( dish.getImageUrl() );
        dishDTO.setCategory( categoryMapper.toDTO( dish.getCategory() ) );
        dishDTO.setCreatedBy( userMapper.toDTO( dish.getCreatedBy() ) );
        dishDTO.setImages( dishImageListToDishImageDTOList( dish.getImages() ) );
        dishDTO.setCreatedAt( dish.getCreatedAt() );
        dishDTO.setUpdatedAt( dish.getUpdatedAt() );

        return dishDTO;
    }

    @Override
    public Dish toEntity(DishDTO dishDTO) {
        if ( dishDTO == null ) {
            return null;
        }

        Dish.DishBuilder dish = Dish.builder();

        dish.id( dishDTO.getId() );
        dish.name( dishDTO.getName() );
        dish.description( dishDTO.getDescription() );
        dish.price( dishDTO.getPrice() );
        dish.active( dishDTO.isActive() );
        dish.prepTimeMinutes( dishDTO.getPrepTimeMinutes() );
        dish.calories( dishDTO.getCalories() );
        dish.allergens( dishDTO.getAllergens() );
        dish.imageUrl( dishDTO.getImageUrl() );
        dish.category( categoryMapper.toEntity( dishDTO.getCategory() ) );
        dish.createdBy( userMapper.toEntity( dishDTO.getCreatedBy() ) );
        dish.createdAt( dishDTO.getCreatedAt() );
        dish.updatedAt( dishDTO.getUpdatedAt() );
        dish.images( dishImageDTOListToDishImageList( dishDTO.getImages() ) );

        return dish.build();
    }

    protected List<DishImageDTO> dishImageListToDishImageDTOList(List<DishImage> list) {
        if ( list == null ) {
            return null;
        }

        List<DishImageDTO> list1 = new ArrayList<DishImageDTO>( list.size() );
        for ( DishImage dishImage : list ) {
            list1.add( dishImageMapper.toDTO( dishImage ) );
        }

        return list1;
    }

    protected List<DishImage> dishImageDTOListToDishImageList(List<DishImageDTO> list) {
        if ( list == null ) {
            return null;
        }

        List<DishImage> list1 = new ArrayList<DishImage>( list.size() );
        for ( DishImageDTO dishImageDTO : list ) {
            list1.add( dishImageMapper.toEntity( dishImageDTO ) );
        }

        return list1;
    }
}
