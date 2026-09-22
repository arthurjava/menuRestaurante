package com.restaurante.service;

import com.restaurante.dto.BusinessHourDTO;
import com.restaurante.dto.RestaurantSettingsDTO;
import com.restaurante.entity.RestaurantSettings;
import com.restaurante.mapper.RestaurantSettingsMapper;
import com.restaurante.repository.RestaurantSettingsRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final RestaurantSettingsRepository repository;
    private final RestaurantSettingsMapper mapper;

    public RestaurantSettingsDTO getRestaurantInfo() {
        Optional<RestaurantSettings> settings = repository.findFirstByOrderByCreatedAtAsc();
        return settings.map(mapper::toDTO).orElse(null);
    }

    @Transactional
    public RestaurantSettingsDTO updateRestaurantInfo(RestaurantSettingsDTO dto) {
        Optional<RestaurantSettings> existingOpt = repository.findFirstByOrderByCreatedAtAsc();
        RestaurantSettings settings;

        if (existingOpt.isPresent()) {
            settings = existingOpt.get();
            settings.setName(dto.getName());
            settings.setTagline(dto.getTagline());
            settings.setDescription(dto.getDescription());
            settings.setLogoUrl(dto.getLogoUrl());
            settings.setCoverUrl(dto.getCoverUrl());
            settings.setPhone(dto.getPhone());
            settings.setEmail(dto.getEmail());
            settings.setAddress(dto.getAddress());
            settings.setWebsite(dto.getWebsite());
            settings.setInstagram(dto.getInstagram());
            settings.setFacebook(dto.getFacebook());
            settings.setBusinessHours(dto.getBusinessHours());
        } else {
            settings = mapper.toEntity(dto);
        }

        RestaurantSettings saved = repository.save(settings);
        return mapper.toDTO(saved);
    }

    public String getBusinessHours() {
        Optional<RestaurantSettings> settings = repository.findFirstByOrderByCreatedAtAsc();
        return settings.map(RestaurantSettings::getBusinessHours).orElse("[]");
    }

    public List<BusinessHourDTO> getBusinessHoursParsed() {
        Optional<RestaurantSettings> settings = repository.findFirstByOrderByCreatedAtAsc();
        String json = settings.map(RestaurantSettings::getBusinessHours).orElse("[]");
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(json, mapper.getTypeFactory().constructCollectionType(List.class, BusinessHourDTO.class));
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @Transactional
    public String updateBusinessHours(String businessHoursJson) {
        Optional<RestaurantSettings> existingOpt = repository.findFirstByOrderByCreatedAtAsc();
        RestaurantSettings settings;

        if (existingOpt.isPresent()) {
            settings = existingOpt.get();
        } else {
            settings = RestaurantSettings.builder()
                .name("Meu Restaurante")
                .tagline("O melhor da culinária")
                .description("Descreva seu restaurante, história, especialidades...")
                .build();
        }

        settings.setBusinessHours(businessHoursJson);
        RestaurantSettings saved = repository.save(settings);
        return saved.getBusinessHours();
    }

    public RestaurantSettingsDTO getContactInfo() {
        Optional<RestaurantSettings> settings = repository.findFirstByOrderByCreatedAtAsc();
        return settings.map(mapper::toDTO).orElse(null);
    }

    @Transactional
    public RestaurantSettingsDTO updateContactInfo(RestaurantSettingsDTO dto) {
        return updateRestaurantInfo(dto);
    }

    public RestaurantSettingsDTO getProfile(UUID userId) {
        Optional<RestaurantSettings> settings = repository.findFirstByOrderByCreatedAtAsc();
        return settings.map(mapper::toDTO).orElse(null);
    }

    @Transactional
    public RestaurantSettingsDTO updateProfile(UUID userId, RestaurantSettingsDTO dto) {
        return updateRestaurantInfo(dto);
    }
}