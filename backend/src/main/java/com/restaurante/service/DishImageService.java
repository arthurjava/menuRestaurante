package com.restaurante.service;

import com.restaurante.entity.DishImage;
import com.restaurante.entity.Dish;
import com.restaurante.repository.DishImageRepository;
import com.restaurante.repository.DishRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class DishImageService {

    @Autowired
    private DishImageRepository dishImageRepository;

    @Autowired
    private DishRepository dishRepository;

    public DishImage uploadImage(UUID dishId, String imageUrl, boolean isPrimary) {
        Dish dish = dishRepository.findById(dishId)
                .orElseThrow(() -> new ResourceNotFoundException("Prato não encontrado"));
        
        DishImage image = DishImage.builder()
                .dish(dish)
                .imageUrl(imageUrl)
                .primary(isPrimary)
                .displayOrder(0)
                .build();
        
        return dishImageRepository.save(image);
    }

    public List<DishImage> findByDish(UUID dishId) {
        return dishImageRepository.findByDish(dishId);
    }

    public DishImage setPrimaryImage(UUID imageId) {
        DishImage image = dishImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Imagem não encontrada"));
        
        // Desmarca todas as imagens principais do prato
        dishImageRepository.findByDish(image.getDish().getId()).forEach(img -> img.setPrimary(false));
        
        // Marca esta imagem como principal
        image.setPrimary(true);
        return dishImageRepository.save(image);
    }

    public void deleteImage(UUID imageId) {
        dishImageRepository.deleteById(imageId);
    }
}