package com.quickcart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddressDto {
    private Long id;

    @NotBlank(message = "Address label is required (e.g. Home, Work, Other)")
    private String label;

    @NotBlank(message = "Receiver name is required")
    private String receiverName;

    @NotBlank(message = "Receiver phone is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone must be a valid 10-15 digit number")
    private String receiverPhone;

    @NotBlank(message = "Street address is required")
    private String streetAddress;

    private String apartmentUnit;
    private String landmark;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Pincode is required")
    private String pincode;

    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean isDefault = false;
}
