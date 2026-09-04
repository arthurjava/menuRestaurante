package com.restaurante.dto.user;

import com.restaurante.entity.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserRequest {
    @NotBlank
    @Email
    private String email;

    @Size(min = 6, max = 100)
    private String password;

    @NotBlank
    @Size(min = 2, max = 100)
    private String name;

    @NotNull
    private Role role;
}