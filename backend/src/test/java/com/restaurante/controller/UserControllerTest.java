package com.restaurante.controller;

import com.restaurante.entity.User;
import com.restaurante.repository.UserRepository;
import com.restaurante.dto.user.UserResponse;
import com.restaurante.dto.common.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        // Setup mock data
    }

    @Test
    void getCurrentUser_shouldReturnUserWhenAuthenticated() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("admin@restaurante.com");
        user.setName("Administrador");
        user.setRole("ADMIN");
        user.setActive(true);

        when(userRepository.findByEmail(anyString()))
                .thenReturn(java.util.Optional.of(user));

        var result = userController.getCurrentUser(null);

        assertThat(result).isNotNull();
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void updateProfile_shouldUpdateUser() {
        UUID userId = UUID.randomUUID();
        var request = new com.restaurante.dto.user.UserRequest();
        request.setName("Nome Atualizado");
        request.setEmail("novo@email.com");

        User existingUser = new User();
        existingUser.setId(userId);
        existingUser.setName("Nome Antigo");
        existingUser.setEmail("antigo@email.com");

        when(userRepository.findById(userId))
                .thenReturn(java.util.Optional.of(existingUser));

        var result = userController.updateProfile(null, request);

        assertThat(result).isNotNull();
    }
}