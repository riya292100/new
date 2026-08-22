package com.quickcart.repository;

import com.quickcart.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByIsActiveTrueOrderByDisplayOrderAsc();
    Optional<Category> findBySlug(String slug);
    Boolean existsByName(String name);
    Boolean existsBySlug(String slug);
}
