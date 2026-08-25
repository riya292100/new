package com.quickcart.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandDto {
    private Long id;

    @NotBlank(message = "Brand name is required")
    private String name;

    private String slug;
    private String logoUrl;
    private String description;
    @Builder.Default
    private Boolean isActive = true;
}
