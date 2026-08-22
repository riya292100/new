package com.quickcart.service;

import com.quickcart.dto.AuthResponse;
import com.quickcart.dto.LoginRequest;
import com.quickcart.dto.SignupRequest;
import com.quickcart.dto.UserResponse;
import com.quickcart.entity.Cart;
import com.quickcart.entity.DeliveryPartner;
import com.quickcart.entity.ERole;
import com.quickcart.entity.Role;
import com.quickcart.entity.User;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.CartRepository;
import com.quickcart.repository.DeliveryPartnerRepository;
import com.quickcart.repository.RoleRepository;
import com.quickcart.repository.UserRepository;
import com.quickcart.security.JwtUtils;
import com.quickcart.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CartRepository cartRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail().trim().toLowerCase(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new AuthResponse(
                jwt,
                userDetails.getId(),
                userDetails.getFullName(),
                userDetails.getEmail(),
                userDetails.getPhone(),
                userDetails.getAvatarUrl(),
                roles
        );
    }

    @Transactional
    public AuthResponse registerUser(SignupRequest signupRequest) {
        String email = signupRequest.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Error: Email is already in use!");
        }

        if (userRepository.existsByPhone(signupRequest.getPhone().trim())) {
            throw new BadRequestException("Error: Phone number is already registered!");
        }

        User user = new User(
                signupRequest.getFullName().trim(),
                email,
                signupRequest.getPhone().trim(),
                encoder.encode(signupRequest.getPassword())
        );

        Set<String> strRoles = signupRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            Role userRole = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                    .orElseThrow(() -> new ResourceNotFoundException("Error: Role ROLE_CUSTOMER is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role.toLowerCase()) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new ResourceNotFoundException("Error: Role ROLE_ADMIN is not found."));
                        roles.add(adminRole);
                        break;
                    case "delivery_partner":
                    case "driver":
                    case "rider":
                        Role deliveryRole = roleRepository.findByName(ERole.ROLE_DELIVERY_PARTNER)
                                .orElseThrow(() -> new ResourceNotFoundException("Error: Role ROLE_DELIVERY_PARTNER is not found."));
                        roles.add(deliveryRole);
                        break;
                    default:
                        Role customerRole = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                                .orElseThrow(() -> new ResourceNotFoundException("Error: Role ROLE_CUSTOMER is not found."));
                        roles.add(customerRole);
                }
            });
        }

        user.setRoles(roles);
        User savedUser = userRepository.save(user);

        // If Customer role, create their shopping cart
        boolean isCustomer = roles.stream().anyMatch(r -> r.getName() == ERole.ROLE_CUSTOMER);
        if (isCustomer) {
            Cart cart = new Cart(savedUser);
            cartRepository.save(cart);
        }

        // If Delivery partner, create delivery partner record
        boolean isDelivery = roles.stream().anyMatch(r -> r.getName() == ERole.ROLE_DELIVERY_PARTNER);
        if (isDelivery) {
            DeliveryPartner partner = new DeliveryPartner(savedUser, "ELECTRIC_SCOOTER", "QC-DL-" + (1000 + savedUser.getId()));
            deliveryPartnerRepository.save(partner);
        }

        // Auto authenticate after signup
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, signupRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        List<String> roleList = roles.stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        return new AuthResponse(
                jwt,
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getAvatarUrl(),
                roleList
        );
    }

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            throw new BadRequestException("No authenticated user found in session.");
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userDetails.getId()));
    }

    public UserResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAvatarUrl(),
                user.getIsActive(),
                roles,
                user.getCreatedAt()
        );
    }
}
