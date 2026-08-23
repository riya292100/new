package com.quickcart.repository;

import com.quickcart.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    Optional<Restaurant> findBySlug(String slug);

    List<Restaurant> findByActiveTrue();

    @Query("SELECT r FROM Restaurant r WHERE r.active = true " +
           "AND (:city IS NULL OR LOWER(r.city) = LOWER(:city)) " +
           "AND (:country IS NULL OR LOWER(r.country) = LOWER(:country)) " +
           "AND (:cuisine IS NULL OR LOWER(r.cuisine) = LOWER(:cuisine)) " +
           "AND (:priceLevel IS NULL OR r.priceLevel = :priceLevel) " +
           "AND (:vegetarian IS NULL OR r.isVegetarianFriendly = :vegetarian) " +
           "AND (:vegan IS NULL OR r.isVeganFriendly = :vegan) " +
           "AND (:dineIn IS NULL OR r.isDineInAvailable = :dineIn) " +
           "AND (:query IS NULL OR (LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.cuisine) LIKE LOWER(CONCAT('%', :query, '%')))) " +
           "ORDER BY r.rating DESC")
    List<Restaurant> searchRestaurants(
            @Param("query") String query,
            @Param("city") String city,
            @Param("country") String country,
            @Param("cuisine") String cuisine,
            @Param("priceLevel") String priceLevel,
            @Param("vegetarian") Boolean vegetarian,
            @Param("vegan") Boolean vegan,
            @Param("dineIn") Boolean dineIn
    );

    @Query("SELECT DISTINCT r.cuisine FROM Restaurant r WHERE r.active = true")
    List<String> findDistinctCuisines();

    @Query("SELECT DISTINCT r.city FROM Restaurant r WHERE r.active = true")
    List<String> findDistinctCities();
}
