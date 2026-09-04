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
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        UserDetailsImpl userDetails = (UserDetailsImpl) userRepository.findByEmail(request.getEmail())
                .map(UserDetailsImpl::new)
                .orElseThrow();

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
                .user(AuthResponse.UserInfo.from(user))
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