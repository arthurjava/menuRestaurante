package com.restaurante.config;

import com.restaurante.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            CorsConfigurationSource corsConfigurationSource
    ) throws Exception {

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            .csrf(csrf -> csrf.disable())

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .formLogin(form -> form.disable())

            .httpBasic(basic -> basic.disable())

            .authorizeHttpRequests(auth -> auth

                // Públicos
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/v3/api-docs/**").permitAll()
                .requestMatchers("/swagger-ui/**").permitAll()
                .requestMatchers("/swagger-ui.html").permitAll()
                .requestMatchers("/uploads/**").permitAll()

                // API pública do cardápio
                .requestMatchers("/menu/**").permitAll()
                .requestMatchers("/dishes/**").permitAll()

                // Todo o restante exige JWT
                .anyRequest().authenticated()
            )

            // IMPORTANTE:
            // coloca o JWT antes do filtro padrão de autenticação
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
            "http://localhost:4200",
            "http://127.0.0.1:4200"
        ));

        configuration.setAllowedMethods(List.of(
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}