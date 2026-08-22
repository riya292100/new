package com.quickcart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String iconName;

    @Column(length = 500)
    private String imageUrl;

    private Integer displayOrder = 0;

    private Boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Category(String name, String slug, String description, String iconName, String imageUrl, Integer displayOrder) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.iconName = iconName;
        this.imageUrl = imageUrl;
        this.displayOrder = displayOrder;
        this.isActive = true;
    }
}
