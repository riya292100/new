package com.quickcart.service;

import com.quickcart.dto.AddressDto;
import com.quickcart.entity.Address;
import com.quickcart.entity.User;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final AuthService authService;

    public List<AddressDto> getUserAddresses() {
        User currentUser = authService.getCurrentUserEntity();
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(currentUser.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AddressDto getAddressById(Long id) {
        User currentUser = authService.getCurrentUserEntity();
        Address address = addressRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));
        return mapToDto(address);
    }

    @Transactional
    public AddressDto createAddress(AddressDto dto) {
        User currentUser = authService.getCurrentUserEntity();

        // If setting this as default, unset previous default
        if (Boolean.TRUE.equals(dto.getIsDefault())) {
            addressRepository.findByUserIdAndIsDefaultTrue(currentUser.getId()).ifPresent(addr -> {
                addr.setIsDefault(false);
                addressRepository.save(addr);
            });
        } else {
            // If it's the first address, make it default automatically
            List<Address> existing = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(currentUser.getId());
            if (existing.isEmpty()) {
                dto.setIsDefault(true);
            }
        }

        Address address = new Address();
        address.setUser(currentUser);
        address.setLabel(dto.getLabel().trim());
        address.setReceiverName(dto.getReceiverName().trim());
        address.setReceiverPhone(dto.getReceiverPhone().trim());
        address.setStreetAddress(dto.getStreetAddress().trim());
        address.setApartmentUnit(dto.getApartmentUnit());
        address.setLandmark(dto.getLandmark());
        address.setCity(dto.getCity().trim());
        address.setState(dto.getState().trim());
        address.setPincode(dto.getPincode().trim());
        address.setLatitude(dto.getLatitude() != null ? dto.getLatitude() : BigDecimal.valueOf(28.6139));
        address.setLongitude(dto.getLongitude() != null ? dto.getLongitude() : BigDecimal.valueOf(77.2090));
        address.setIsDefault(Boolean.TRUE.equals(dto.getIsDefault()));

        return mapToDto(addressRepository.save(address));
    }

    @Transactional
    public AddressDto updateAddress(Long id, AddressDto dto) {
        User currentUser = authService.getCurrentUserEntity();
        Address address = addressRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));

        if (Boolean.TRUE.equals(dto.getIsDefault()) && !Boolean.TRUE.equals(address.getIsDefault())) {
            addressRepository.findByUserIdAndIsDefaultTrue(currentUser.getId()).ifPresent(addr -> {
                addr.setIsDefault(false);
                addressRepository.save(addr);
            });
            address.setIsDefault(true);
        }

        address.setLabel(dto.getLabel().trim());
        address.setReceiverName(dto.getReceiverName().trim());
        address.setReceiverPhone(dto.getReceiverPhone().trim());
        address.setStreetAddress(dto.getStreetAddress().trim());
        address.setApartmentUnit(dto.getApartmentUnit());
        address.setLandmark(dto.getLandmark());
        address.setCity(dto.getCity().trim());
        address.setState(dto.getState().trim());
        address.setPincode(dto.getPincode().trim());
        if (dto.getLatitude() != null) address.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) address.setLongitude(dto.getLongitude());

        return mapToDto(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long id) {
        User currentUser = authService.getCurrentUserEntity();
        Address address = addressRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));
        addressRepository.delete(address);
    }

    public AddressDto mapToDto(Address address) {
        return new AddressDto(
                address.getId(),
                address.getLabel(),
                address.getReceiverName(),
                address.getReceiverPhone(),
                address.getStreetAddress(),
                address.getApartmentUnit(),
                address.getLandmark(),
                address.getCity(),
                address.getState(),
                address.getPincode(),
                address.getLatitude(),
                address.getLongitude(),
                address.getIsDefault()
        );
    }
}
