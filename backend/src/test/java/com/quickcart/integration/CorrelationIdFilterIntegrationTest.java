package com.quickcart.integration;

import com.quickcart.security.CorrelationIdFilter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CorrelationIdFilterIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Should generate X-Correlation-ID and X-Response-Time-Millis headers when not provided")
    void testGeneratesCorrelationIdWhenMissing() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(header().exists(CorrelationIdFilter.CORRELATION_ID_HEADER))
                .andExpect(header().exists(CorrelationIdFilter.RESPONSE_TIME_HEADER));
    }

    @Test
    @DisplayName("Should preserve and propagate inbound X-Correlation-ID header in the HTTP response")
    void testPropagatesExistingCorrelationId() throws Exception {
        String testCorrelationId = "test-corr-" + UUID.randomUUID();

        mockMvc.perform(get("/api/v1/health")
                        .header(CorrelationIdFilter.CORRELATION_ID_HEADER, testCorrelationId))
                .andExpect(status().isOk())
                .andExpect(header().string(CorrelationIdFilter.CORRELATION_ID_HEADER, testCorrelationId))
                .andExpect(header().exists(CorrelationIdFilter.RESPONSE_TIME_HEADER));
    }
}
