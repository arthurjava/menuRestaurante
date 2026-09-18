package com.restaurante.mapper;

import com.restaurante.dto.CategoryDTO;
import com.restaurante.dto.DishDTO;
import com.restaurante.dto.DishImageDTO;
import com.restaurante.dto.UserDTO;
import com.restaurante.entity.Category;
import com.restaurante.entity.Dish;
import com.restaurante.entity.DishImage;
import com.restaurante.entity.User;
import com.restaurante.security.Role;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-17T23:45:23-0300",
    comments = "version: 1.6.0, compiler: javac, environment: Java 25.0.4.1 (Eclipse Adoptium)"
)
@Component
public class CategoryMapperImpl implements CategoryMapper {

    @Override
    public CategoryDTO toDTO(Category category) {
        if ( category == null ) {
            return null;
        }

        CategoryDTO categoryDTO = new CategoryDTO();

        categoryDTO.setId( category.getId() );
        categoryDTO.setName( category.getName() );
        categoryDTO.setDescription( category.getDescription() );
        categoryDTO.setImageUrl( category.getImageUrl() );
        categoryDTO.setDisplayOrder( category.getDisplayOrder() );
        categoryDTO.setActive( category.isActive() );
        categoryDTO.setCreatedAt( category.getCreatedAt() );
        categoryDTO.setUpdatedAt( category.getUpdatedAt() );
        categoryDTO.setDishes( dishListToDishDTOList( category.getDishes() ) );

        return categoryDTO;
    }

    @Override
    public Category toEntity(CategoryDTO categoryDTO) {
        if ( categoryDTO == null ) {
            return null;
        }

        Category.CategoryBuilder category = Category.builder();

        category.id( categoryDTO.getId() );
        category.name( categoryDTO.getName() );
        category.description( categoryDTO.getDescription() );
        category.imageUrl( categoryDTO.getImageUrl() );
        category.displayOrder( categoryDTO.getDisplayOrder() );
        category.active( categoryDTO.isActive() );
        category.createdAt( categoryDTO.getCreatedAt() );
        category.updatedAt( categoryDTO.getUpdatedAt() );
        category.dishes( dishDTOListToDishList( categoryDTO.getDishes() ) );

        return category.build();
    }

    protected UserDTO userToUserDTO(User user) {
        if ( user == null ) {
            return null;
        }

        UserDTO userDTO = new UserDTO();

        userDTO.setId( user.getId() );
        userDTO.setEmail( user.getEmail() );
        userDTO.setName( user.getName() );
        if ( user.getRole() != null ) {
            userDTO.setRole( user.getRole().name() );
        }
        userDTO.setActive( user.isActive() );
        userDTO.setCreatedAt( user.getCreatedAt() );
        userDTO.setUpdatedAt( user.getUpdatedAt() );

        return userDTO;
    }

    protected DishImageDTO dishImageToDishImageDTO(DishImage dishImage) {
        if ( dishImage == null ) {
            return null;
        }

        DishImageDTO dishImageDTO = new DishImageDTO();

        dishImageDTO.setId( dishImage.getId() );
        dishImageDTO.setImageUrl( dishImage.getImageUrl() );
        dishImageDTO.setPrimary( dishImage.isPrimary() );
        dishImageDTO.setDisplayOrder( dishImage.getDisplayOrder() );
        dishImageDTO.setCreatedAt( dishImage.getCreatedAt() );

        return dishImageDTO;
    }

    protected List<DishImageDTO> dishImageListToDishImageDTOList(List<DishImage> list) {
        if ( list == null ) {
            return null;
        }

        List<DishImageDTO> list1 = new ArrayList<DishImageDTO>( list.size() );
        for ( DishImage dishImage : list ) {
            list1.add( dishImageToDishImageDTO( dishImage ) );
        }

        return list1;
    }

    protected DishDTO dishToDishDTO(Dish dish) {
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
        dishDTO.setCategory( toDTO( dish.getCategory() ) );
        dishDTO.setCreatedBy( userToUserDTO( dish.getCreatedBy() ) );
        dishDTO.setImages( dishImageListToDishImageDTOList( dish.getImages() ) );
        dishDTO.setCreatedAt( dish.getCreatedAt() );
        dishDTO.setUpdatedAt( dish.getUpdatedAt() );

        return dishDTO;
    }

    protected List<DishDTO> dishListToDishDTOList(List<Dish> list) {
        if ( list == null ) {
            return null;
        }

        List<DishDTO> list1 = new ArrayList<DishDTO>( list.size() );
        for ( Dish dish : list ) {
            list1.add( dishToDishDTO( dish ) );
        }

        return list1;
    }

    protected User userDTOToUser(UserDTO userDTO) {
        if ( userDTO == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.id( userDTO.getId() );
        user.email( userDTO.getEmail() );
        user.name( userDTO.getName() );
        if ( userDTO.getRole() != null ) {
            user.role( Enum.valueOf( Role.class, userDTO.getRole() ) );
        }
        user.active( userDTO.isActive() );
        user.createdAt( userDTO.getCreatedAt() );
        user.updatedAt( userDTO.getUpdatedAt() );

        return user.build();
    }

    protected DishImage dishImageDTOToDishImage(DishImageDTO dishImageDTO) {
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

    protected List<DishImage> dishImageDTOListToDishImageList(List<DishImageDTO> list) {
        if ( list == null ) {
            return null;
        }

        List<DishImage> list1 = new ArrayList<DishImage>( list.size() );
        for ( DishImageDTO dishImageDTO : list ) {
            list1.add( dishImageDTOToDishImage( dishImageDTO ) );
        }

        return list1;
    }

    protected Dish dishDTOToDish(DishDTO dishDTO) {
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
        dish.category( toEntity( dishDTO.getCategory() ) );
        dish.createdBy( userDTOToUser( dishDTO.getCreatedBy() ) );
        dish.createdAt( dishDTO.getCreatedAt() );
        dish.updatedAt( dishDTO.getUpdatedAt() );
        dish.images( dishImageDTOListToDishImageList( dishDTO.getImages() ) );

        return dish.build();
    }

    protected List<Dish> dishDTOListToDishList(List<DishDTO> list) {
        if ( list == null ) {
            return null;
        }

        List<Dish> list1 = new ArrayList<Dish>( list.size() );
        for ( DishDTO dishDTO : list ) {
            list1.add( dishDTOToDish( dishDTO ) );
        }

        return list1;
    }
}
