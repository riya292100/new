package com.quickcart.service;

import com.quickcart.dto.*;
import com.quickcart.entity.*;
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
    private final RefreshTokenService refreshTokenService;
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

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        return new AuthResponse(
                jwt,
                refreshToken.getToken(),
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
                        Role driverRole = roleRepository.findByName(ERole.ROLE_DELIVERY_PARTNER)
                                .orElseThrow(() -> new ResourceNotFoundException("Error: Role ROLE_DELIVERY_PARTNER is not found."));
                        roles.add(driverRole);
                        break;
                    case "store_manager":
                    case "manager":
                        Role managerRole = roleRepository.findByName(ERole.ROLE_STORE_MANAGER)
                                .orElseThrow(() -> new ResourceNotFoundException("Error: Role ROLE_STORE_MANAGER is not found."));
                        roles.add(managerRole);
                        break;
                    case "support":
                    case "support_agent":
                        Role supportRole = roleRepository.findByName(ERole.ROLE_SUPPORT_AGENT)
                                .orElseThrow(() -> new ResourceNotFoundException("Error: Role ROLE_SUPPORT_AGENT is not found."));
                        roles.add(supportRole);
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

        // Auto-create persistent empty cart for customer
        Cart cart = new Cart();
        cart.setUser(savedUser);
        cartRepository.save(cart);

        // If driver role, create DeliveryPartner entity
        boolean isDriver = roles.stream().anyMatch(r -> r.getName() == ERole.ROLE_DELIVERY_PARTNER);
        if (isDriver) {
            DeliveryPartner partner = new DeliveryPartner();
            partner.setUser(savedUser);
            partner.setVehicleType("ELECTRIC_SCOOTER");
            partner.setVehicleNumber("KA-01-QC-" + (1000 + (int)(Math.random() * 9000)));
            deliveryPartnerRepository.save(partner);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, signupRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        List<String> roleNames = roles.stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser.getId());

        return new AuthResponse(
                jwt,
                refreshToken.getToken(),
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getAvatarUrl(),
                roleNames
        );
    }

    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtils.generateTokenFromUsername(user.getEmail());
                    return new TokenRefreshResponse(token, requestRefreshToken);
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @Transactional
    public void logoutUser() {
        UserDetailsImpl userDetails = getCurrentAuthenticatedUser();
        if (userDetails != null) {
            refreshTokenService.deleteByUserId(userDetails.getId());
        }
    }

    @Transactional
    public void resetPassword(PasswordResetRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters");
        }

        user.setPasswordHash(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
        refreshTokenService.deleteByUserId(user.getId());
    }

    public UserDetailsImpl getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        return (UserDetailsImpl) authentication.getPrincipal();
    }

    public User getCurrentUserEntity() {
        UserDetailsImpl userDetails = getCurrentAuthenticatedUser();
        if (userDetails == null) {
            throw new BadRequestException("User is not authenticated");
        }
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserResponse getUserProfile() {
        User user = getCurrentUserEntity();
        return mapUserToProfile(user);
    }

    public UserResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapUserToProfile(user);
    }

    private UserResponse mapUserToProfile(User user) {
        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAvatarUrl(),
                roles,
                user.getCreatedAt()
        );
    }
}
