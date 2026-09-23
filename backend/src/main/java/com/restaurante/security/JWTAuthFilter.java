package com.restaurante.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JWTAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JWTAuthFilter.class);

    private final JWTUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JWTAuthFilter(JWTUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        log.debug("JWT Filter - Path: {}, AuthHeader: {}", request.getRequestURI(), authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("JWT Filter - No valid Authorization header, continuing filter chain");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        log.debug("JWT Filter - Token extracted, length: {}", token.length());

        if (token.isEmpty()) {
            log.warn("JWT Filter - Empty token after Bearer prefix");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String email = jwtUtil.extractEmail(token);
            log.debug("JWT Filter - Email extracted: {}", email);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(email);

                if (jwtUtil.tokenValido(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(userDetails);
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("JWT Filter - Authentication set for user: {}", email);
                } else {
                    log.warn("JWT Filter - Token validation failed for user: {}", email);
                }
            }
        } catch (Exception e) {
            log.error("JWT Filter - Error processing token: {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }
}