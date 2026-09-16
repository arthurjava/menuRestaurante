package com.restaurante.security;

import com.restaurante.entity.User;
import com.restaurante.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + email));
        
        org.springframework.security.core.userdetails.User.UserBuilder builder = 
                org.springframework.security.core.userdetails.User.withUsername(user.getEmail());
        builder.password(user.getPassword());
        builder.authorities(user.getRole().name());
        builder.accountExpired(false)
               .accountLocked(false)
               .credentialsExpired(false)
               .disabled(!user.isActive());
        return builder.build();
    }
}