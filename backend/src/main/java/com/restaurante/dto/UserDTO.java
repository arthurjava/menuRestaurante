package com.restaurante.dto;

import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private UUID id;
    private String email;
    private String name;
    private String role;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}