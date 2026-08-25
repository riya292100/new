package com.quickcart.repository;

import com.quickcart.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByPasswordResetToken(String passwordResetToken);
    Optional<User> findByVerificationToken(String verificationToken);
    Boolean existsByEmail(String email);
    Boolean existsByPhone(String phone);
}
