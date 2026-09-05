package com.restaurante.service;

import com.restaurante.dto.auth.AuthResponse;
import com.restaurante.dto.auth.LoginRequest;
import com.restaurante.dto.auth.RegisterRequest;
import com.restaurante.entity.Role;
import com.restaurante.entity.User;
import com.restaurante.exception.DuplicateResourceException;
import com.restaurante.repository.UserRepository;
import com.restaurante.security.JwtService;
import com.restaurante.security.UserDetailsImpl;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + request.getEmail()));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        UserDetailsImpl userDetails = new UserDetailsImpl(user);
        String accessToken = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .expiresIn(jwtService.extractExpiration(accessToken).getTime() - System.currentTimeMillis())
                .user(AuthResponse.UserInfo.from(userDetails.getUser()))
                .build();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setRole(Role.STAFF);

        userRepository.save(user);

        UserDetailsImpl userDetails = new UserDetailsImpl(user);
        String accessToken = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .expiresIn(jwtService.extractExpiration(accessToken).getTime() - System.currentTimeMillis())
                .user(AuthResponse.UserInfo.from(userDetails.getUser()))
                .build();
    }

    public AuthResponse refreshToken(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        UserDetailsImpl userDetails = new UserDetailsImpl(user);
        String accessToken = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .expiresIn(jwtService.extractExpiration(accessToken).getTime() - System.currentTimeMillis())
                .user(AuthResponse.UserInfo.from(user))
                .build();
    }
}