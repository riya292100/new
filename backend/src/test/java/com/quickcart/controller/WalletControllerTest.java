package com.quickcart.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quickcart.dto.*;
import com.quickcart.entity.ERole;
import com.quickcart.entity.Role;
import com.quickcart.entity.User;
import com.quickcart.entity.WalletTransactionType;
import com.quickcart.service.AuthService;
import com.quickcart.service.WalletService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class WalletControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private WalletService walletService;

    private User mockUser;
    private WalletResponse mockWalletResponse;

    @BeforeEach
    void setUp() {
        mockUser = new User("Customer", "customer@quickcart.com", "9876543210", "pass");
        mockUser.setId(1L);
        mockUser.setRoles(Set.of(new Role(ERole.ROLE_CUSTOMER)));

        mockWalletResponse = WalletResponse.builder()
                .id(1L)
                .userId(1L)
                .userFullName("Customer")
                .balance(BigDecimal.valueOf(100.00))
                .totalEarned(BigDecimal.valueOf(100.00))
                .totalSpent(BigDecimal.ZERO)
                .cashbackRatePercentage(5.0)
                .isActive(true)
                .recentTransactions(new ArrayList<>())
                .build();

        when(authService.getCurrentAuthenticatedUser()).thenReturn(mockUser);
    }

    @Test
    @WithMockUser(username = "customer@quickcart.com", roles = {"CUSTOMER"})
    @DisplayName("GET /api/wallet returns wallet details with welcome bonus")
    void testGetMyWallet() throws Exception {
        when(walletService.getWallet(mockUser)).thenReturn(mockWalletResponse);

        mockMvc.perform(get("/api/wallet").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.balance").value(100.00))
                .andExpect(jsonPath("$.data.cashbackRatePercentage").value(5.0));
    }

    @Test
    @WithMockUser(username = "customer@quickcart.com", roles = {"CUSTOMER"})
    @DisplayName("GET /api/wallet/transactions returns paginated transactions")
    void testGetMyTransactions() throws Exception {
        WalletTransactionDto tx = WalletTransactionDto.builder()
                .id(1L)
                .amount(BigDecimal.valueOf(100.00))
                .type(WalletTransactionType.CREDIT_WELCOME_BONUS)
                .description("Welcome bonus")
                .balanceAfter(BigDecimal.valueOf(100.00))
                .createdAt(LocalDateTime.now())
                .build();

        when(walletService.getTransactions(eq(mockUser), any()))
                .thenReturn(new PageImpl<>(List.of(tx)));

        mockMvc.perform(get("/api/wallet/transactions?page=0&size=5").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content[0].amount").value(100.00));
    }

    @Test
    @WithMockUser(username = "customer@quickcart.com", roles = {"CUSTOMER"})
    @DisplayName("POST /api/wallet/redeem-preview calculates usable discount")
    void testPreviewRedemption() throws Exception {
        when(walletService.getWallet(mockUser)).thenReturn(mockWalletResponse);

        WalletRedeemRequest request = new WalletRedeemRequest(BigDecimal.valueOf(500.00), BigDecimal.valueOf(50.00));

        mockMvc.perform(post("/api/wallet/redeem-preview")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.appliedDiscount").value(50.00))
                .andExpect(jsonPath("$.data.finalPayableAmount").value(450.00));
    }

    @Test
    @WithMockUser(username = "customer@quickcart.com", roles = {"CUSTOMER"})
    @DisplayName("POST /api/wallet/add-demo-funds adds promo bonus to wallet")
    void testAddDemoFunds() throws Exception {
        WalletResponse updatedResponse = WalletResponse.builder()
                .id(1L)
                .userId(1L)
                .userFullName("Customer")
                .balance(BigDecimal.valueOf(250.00))
                .totalEarned(BigDecimal.valueOf(250.00))
                .totalSpent(BigDecimal.ZERO)
                .cashbackRatePercentage(5.0)
                .isActive(true)
                .build();

        when(walletService.addFunds(eq(mockUser), any(), any(), any())).thenReturn(updatedResponse);

        WalletAddFundsRequest request = new WalletAddFundsRequest(BigDecimal.valueOf(150.00), "Weekend Promo Bonus");

        mockMvc.perform(post("/api/wallet/add-demo-funds")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.balance").value(250.00));
    }
}
