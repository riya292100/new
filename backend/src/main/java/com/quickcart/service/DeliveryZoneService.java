package com.quickcart.service;

import com.quickcart.dto.DeliveryZoneDto;
import com.quickcart.entity.DeliveryZone;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.DeliveryZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryZoneService {

    private final DeliveryZoneRepository deliveryZoneRepository;

    public List<DeliveryZoneDto> getAllZones() {
        return deliveryZoneRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DeliveryZoneDto getZoneById(Long id) {
        DeliveryZone zone = deliveryZoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Zone not found with id: " + id));
        return mapToDto(zone);
    }

    @Transactional
    public DeliveryZoneDto createZone(DeliveryZoneDto dto) {
        if (deliveryZoneRepository.findByZoneCode(dto.getZoneCode()).isPresent()) {
            throw new BadRequestException("Delivery zone with code '" + dto.getZoneCode() + "' already exists");
        }

        DeliveryZone zone = DeliveryZone.builder()
                .zoneCode(dto.getZoneCode().trim().toUpperCase())
                .name(dto.getName().trim())
                .city(dto.getCity().trim())
                .centerLatitude(dto.getCenterLatitude())
                .centerLongitude(dto.getCenterLongitude())
                .radiusKm(dto.getRadiusKm() != null ? dto.getRadiusKm() : BigDecimal.valueOf(8.0))
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();

        return mapToDto(deliveryZoneRepository.save(zone));
    }

    @Transactional
    public DeliveryZoneDto updateZone(Long id, DeliveryZoneDto dto) {
        DeliveryZone zone = deliveryZoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Zone not found with id: " + id));

        zone.setName(dto.getName().trim());
        zone.setCity(dto.getCity().trim());
        zone.setCenterLatitude(dto.getCenterLatitude());
        zone.setCenterLongitude(dto.getCenterLongitude());
        if (dto.getRadiusKm() != null) zone.setRadiusKm(dto.getRadiusKm());
        if (dto.getIsActive() != null) zone.setIsActive(dto.getIsActive());

        return mapToDto(deliveryZoneRepository.save(zone));
    }

    @Transactional
    public void deleteZone(Long id) {
        DeliveryZone zone = deliveryZoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Zone not found with id: " + id));
        zone.setIsActive(false);
        deliveryZoneRepository.save(zone);
    }

    private DeliveryZoneDto mapToDto(DeliveryZone z) {
        return DeliveryZoneDto.builder()
                .id(z.getId())
                .zoneCode(z.getZoneCode())
                .name(z.getName())
                .city(z.getCity())
                .centerLatitude(z.getCenterLatitude())
                .centerLongitude(z.getCenterLongitude())
                .radiusKm(z.getRadiusKm())
                .isActive(z.getIsActive())
                .build();
    }
}
