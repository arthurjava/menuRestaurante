package com.restaurante.mapper;

import com.restaurante.entity.User;
import com.restaurante.dto.UserDTO;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(reportingPolicy = ReportingPolicy.NO_ERROR)
public interface UserMapper {
    UserDTO toDTO(User user);
    User toEntity(UserDTO userDTO);
}