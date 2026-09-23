package com.restaurante.controller;

import com.restaurante.dto.UserDTO;
import com.restaurante.entity.User;
import com.restaurante.security.JWTUtil;
import com.restaurante.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;
    
    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        log.debug("Login attempt for email: {}", loginRequest.getEmail());
        
        User user = userService.findByEmail(loginRequest.getEmail());
        log.debug("User found: {}", user != null);
        
        if (user == null) {
            log.warn("User not found for email: {}", loginRequest.getEmail());
            return ResponseEntity.badRequest().body("Credenciais inválidas");
        }
        
        log.debug("User password hash: {}", user.getPassword());
        log.debug("Attempting password match for: {}", loginRequest.getPassword());
        
        boolean passwordMatch = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        log.debug("Password match result: {}", passwordMatch);
        
        if (!passwordMatch) {
            log.warn("Password mismatch for user: {}", loginRequest.getEmail());
            return ResponseEntity.badRequest().body("Credenciais inválidas");
        }
        
        log.debug("Password matched, generating token for user: {}", user.getEmail());
        
        org.springframework.security.core.userdetails.UserDetails userDetails = 
            org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRole().name())
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!user.isActive())
                .build();
        
        log.debug("Generating JWT token");
        String token = jwtUtil.generateToken(userDetails);
        log.debug("Token generated successfully");
        
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setName(user.getName());
        userDTO.setRole(user.getRole().name());
        userDTO.setActive(user.isActive());
        userDTO.setCreatedAt(user.getCreatedAt());
        userDTO.setUpdatedAt(user.getUpdatedAt());
        
        log.debug("Login successful for user: {}", user.getEmail());
        return ResponseEntity.ok(new AuthResponse(token, userDTO));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        log.debug("Register attempt for email: {}", user.getEmail());
        User createdUser = userService.createUser(user);
        log.debug("User created with ID: {}", createdUser.getId());
        
        UserDTO userDTO = new UserDTO();
        userDTO.setId(createdUser.getId());
        userDTO.setEmail(createdUser.getEmail());
        userDTO.setName(createdUser.getName());
        userDTO.setRole(createdUser.getRole().name());
        userDTO.setActive(createdUser.isActive());
        userDTO.setCreatedAt(createdUser.getCreatedAt());
        userDTO.setUpdatedAt(createdUser.getUpdatedAt());
        return ResponseEntity.ok(userDTO);
    }

    @PostMapping("/test-hash")
    public ResponseEntity<?> testHash() {
        String password = "admin123";
        String hash = passwordEncoder.encode(password);
        log.info("Generated hash for '{}': {}", password, hash);
        
        boolean match = passwordEncoder.matches(password, hash);
        log.info("Match test: {}", match);
        
        return ResponseEntity.ok(Map.of("hash", hash, "match", match));
    }

    static class LoginRequest {
        private String email;
        private String password;
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    static class AuthResponse {
        private String accessToken;
        private UserDTO user;
        
        public AuthResponse(String accessToken, UserDTO user) { 
            this.accessToken = accessToken;
            this.user = user;
        }
        public String getAccessToken() { return accessToken; }
        public UserDTO getUser() { return user; }
    }
}