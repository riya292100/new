package com.quickcart.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PincodeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/pincode/check validates Delhi pincode with 1-Hour SuperFast delivery")
    void testCheckPincodeDelhi() throws Exception {
        mockMvc.perform(get("/api/pincode/check").param("pincode", "110001").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.isServiceable").value(true))
                .andExpect(jsonPath("$.data.isOneHourAvailable").value(true))
                .andExpect(jsonPath("$.data.city").value("New Delhi"));
    }

    @Test
    @DisplayName("GET /api/pincode/check validates Bengaluru pincode")
    void testCheckPincodeBengaluru() throws Exception {
        mockMvc.perform(get("/api/pincode/check").param("pincode", "560001").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.city").value("Bengaluru"))
                .andExpect(jsonPath("$.data.isOneHourAvailable").value(true));
    }

    @Test
    @DisplayName("GET /api/pincode/check handles invalid pincode")
    void testCheckInvalidPincode() throws Exception {
        mockMvc.perform(get("/api/pincode/check").param("pincode", "0011").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isServiceable").value(false));
    }
}
