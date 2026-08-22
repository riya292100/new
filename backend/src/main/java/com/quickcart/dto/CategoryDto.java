package com.quickcart.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    private Long id;

    @NotBlank(message = "Category name is required")
    private String name;

    private String slug;
    private String description;
    private String iconName;
    private String imageUrl;
    private Integer displayOrder = 0;
    private Boolean isActive = true;
    private Long productCount;
}
