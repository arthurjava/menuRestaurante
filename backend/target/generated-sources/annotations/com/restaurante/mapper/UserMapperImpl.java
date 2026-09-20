package com.restaurante.mapper;

import com.restaurante.dto.UserDTO;
import com.restaurante.entity.User;
import com.restaurante.security.Role;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-19T23:44:32+0000",
    comments = "version: 1.6.0, compiler: javac, environment: Java 25.0.4 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserDTO toDTO(User user) {
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

    @Override
    public User toEntity(UserDTO userDTO) {
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
}
