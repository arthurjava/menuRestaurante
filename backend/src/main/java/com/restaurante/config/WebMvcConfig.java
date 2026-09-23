package com.restaurante.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Value("${app.upload.url-prefix:/uploads}")
    private String urlPrefix;

    @Value("${app.cors.allowed-origins:http://localhost:4200}")
    private String allowedOrigins;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
        String resourceLocation = uploadPath.toUri().toString();

        registry.addResourceHandler(urlPrefix + "/**")
                .addResourceLocations(resourceLocation)
                .setCachePeriod(3600)
                .resourceChain(true);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping(urlPrefix + "/**")
                .allowedOrigins(allowedOrigins.split(","))
                .allowedMethods("GET", "HEAD", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
}