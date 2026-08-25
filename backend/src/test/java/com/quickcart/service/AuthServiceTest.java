package com.quickcart.service;

import com.quickcart.dto.AuthResponse;
import com.quickcart.dto.SignupRequest;
import com.quickcart.entity.ERole;
import com.quickcart.entity.Role;
import com.quickcart.entity.User;
import com.quickcart.exception.BadRequestException;
import com.quickcart.repository.CartRepository;
import com.quickcart.repository.DeliveryPartnerRepository;
import com.quickcart.repository.RoleRepository;
import com.quickcart.repository.UserRepository;
import com.quickcart.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private DeliveryPartnerRepository deliveryPartnerRepository;

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private SignupRequest signupRequest;
    private Role customerRole;

    @BeforeEach
    void setUp() {
        signupRequest = new SignupRequest();
        signupRequest.setFullName("John Doe");
        signupRequest.setEmail("john@example.com");
        signupRequest.setPhone("9876543210");
        signupRequest.setPassword("Password@123");
        signupRequest.setRoles(Collections.singleton("customer"));

        customerRole = new Role(1L, ERole.ROLE_CUSTOMER);
    }

    @Test
    void testRegisterUser_Success() {
        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("9876543210")).thenReturn(false);
        when(encoder.encode(any())).thenReturn("encodedPassword");
        when(roleRepository.findByName(ERole.ROLE_CUSTOMER)).thenReturn(Optional.of(customerRole));
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("mock-jwt-token");
        when(refreshTokenService.createRefreshToken(any())).thenReturn(com.quickcart.entity.RefreshToken.builder().token("mock-refresh-token").build());

        User savedUser = new User("John Doe", "john@example.com", "9876543210", "encodedPassword");
        savedUser.setId(1L);
        savedUser.setRoles(new HashSet<>(Collections.singletonList(customerRole)));
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        AuthResponse response = authService.registerUser(signupRequest);

        assertNotNull(response);
        assertEquals("John Doe", response.getFullName());
        assertEquals("john@example.com", response.getEmail());
        assertEquals("mock-jwt-token", response.getToken());
        verify(cartRepository, times(1)).save(any());
    }

    @Test
    void testRegisterUser_EmailAlreadyExists() {
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.registerUser(signupRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void testRegisterUser_PhoneAlreadyExists() {
        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("9876543210")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.registerUser(signupRequest));
        verify(userRepository, never()).save(any());
    }
}
