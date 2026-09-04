package com.restaurante.controller;

import com.restaurante.dto.auth.AuthResponse;
import com.restaurante.dto.auth.LoginRequest;
import com.restaurante.dto.auth.RegisterRequest;
import com.restaurante.dto.common.ApiResponse;
import com.restaurante.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(HttpServletRequest request) {
        Authentication auth = (Authentication) request.getUserPrincipal();
        if (auth == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        String email = auth.getName();
        AuthResponse response = authService.refreshToken(email);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        // TODO: Implement token blacklist if needed
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }
}