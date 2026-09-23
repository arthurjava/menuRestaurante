package com.restaurante.controller;

import com.restaurante.dto.RestaurantSettingsDTO;
import com.restaurante.service.SettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping("/restaurant-info")
    public ResponseEntity<RestaurantSettingsDTO> getRestaurantInfo() {
        RestaurantSettingsDTO info = settingsService.getRestaurantInfo();
        if (info == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(info);
    }

    @PutMapping("/restaurant-info")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<RestaurantSettingsDTO> updateRestaurantInfo(@RequestBody RestaurantSettingsDTO dto) {
        RestaurantSettingsDTO updated = settingsService.updateRestaurantInfo(dto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/business-hours")
    public ResponseEntity<String> getBusinessHours() {
        String hours = settingsService.getBusinessHours();
        return ResponseEntity.ok(hours);
    }

    @PutMapping("/business-hours")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<String> updateBusinessHours(@RequestBody String businessHoursJson) {
        String updated = settingsService.updateBusinessHours(businessHoursJson);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/contact-info")
    public ResponseEntity<RestaurantSettingsDTO> getContactInfo() {
        RestaurantSettingsDTO info = settingsService.getContactInfo();
        if (info == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(info);
    }

    @PutMapping("/contact-info")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<RestaurantSettingsDTO> updateContactInfo(@RequestBody RestaurantSettingsDTO dto) {
        RestaurantSettingsDTO updated = settingsService.updateContactInfo(dto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/profile")
    public ResponseEntity<RestaurantSettingsDTO> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        RestaurantSettingsDTO profile = settingsService.getProfile(userId);
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<RestaurantSettingsDTO> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                                                 @RequestBody RestaurantSettingsDTO dto) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        RestaurantSettingsDTO updated = settingsService.updateProfile(userId, dto);
        return ResponseEntity.ok(updated);
    }
}