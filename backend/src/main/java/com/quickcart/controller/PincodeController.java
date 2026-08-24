package com.quickcart.controller;

import com.quickcart.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/pincode")
public class PincodeController {

    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkPincode(
            @RequestParam(name = "pincode", defaultValue = "110001") String pincode) {
        return ResponseEntity.ok(ApiResponse.success(resolvePincode(pincode.trim())));
    }

    @GetMapping("/{pincode}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPincodeDetails(
            @PathVariable String pincode) {
        return ResponseEntity.ok(ApiResponse.success(resolvePincode(pincode.trim())));
    }

    private Map<String, Object> resolvePincode(String pin) {
        Map<String, Object> res = new HashMap<>();
        res.put("pincode", pin);

        // Basic validation: 6 digits
        if (!pin.matches("^[1-9][0-9]{5}$")) {
            res.put("isServiceable", false);
            res.put("isOneHourAvailable", false);
            res.put("message", "Please enter a valid 6-digit Indian PIN code.");
            return res;
        }

        int prefix2 = Integer.parseInt(pin.substring(0, 2));

        String city = "India Region";
        String state = "India";
        String hub = "QuickCart Pan-India Logistics Center";
        boolean express = true;

        if (pin.startsWith("11")) {
            city = "New Delhi";
            state = "Delhi NCR";
            hub = "QuickCart Express Hub #01 - Connaught Place";
        } else if (pin.startsWith("12") || pin.startsWith("13")) {
            city = "Gurugram / Haryana";
            state = "Haryana";
            hub = "QuickCart Express Hub #02 - Cyber City";
        } else if (pin.startsWith("20")) {
            city = "Noida / Ghaziabad";
            state = "Uttar Pradesh";
            hub = "QuickCart Express Hub #03 - Sector 62";
        } else if (pin.startsWith("40")) {
            city = "Mumbai";
            state = "Maharashtra";
            hub = "QuickCart Express Hub #04 - Bandra West";
        } else if (pin.startsWith("41")) {
            city = "Pune";
            state = "Maharashtra";
            hub = "QuickCart Express Hub #05 - Koregaon Park";
        } else if (pin.startsWith("56")) {
            city = "Bengaluru";
            state = "Karnataka";
            hub = "QuickCart Express Hub #06 - Indiranagar / Koramangala";
        } else if (pin.startsWith("50")) {
            city = "Hyderabad";
            state = "Telangana";
            hub = "QuickCart Express Hub #07 - HITEC City";
        } else if (pin.startsWith("60")) {
            city = "Chennai";
            state = "Tamil Nadu";
            hub = "QuickCart Express Hub #08 - T. Nagar";
        } else if (pin.startsWith("70")) {
            city = "Kolkata";
            state = "West Bengal";
            hub = "QuickCart Express Hub #09 - Salt Lake Sector V";
        } else if (pin.startsWith("38")) {
            city = "Ahmedabad";
            state = "Gujarat";
            hub = "QuickCart Express Hub #10 - SG Highway";
        } else if (pin.startsWith("30")) {
            city = "Jaipur";
            state = "Rajasthan";
            hub = "QuickCart Express Hub #11 - Malviya Nagar";
        } else {
            // Tier 2/3 Pan India
            city = "Pan-India Tier-2/3 Network";
            state = "National Fulfillment";
            hub = "QuickCart National Cross-Dock Hub";
            express = false;
        }

        res.put("isServiceable", true);
        res.put("isOneHourAvailable", express);
        res.put("city", city);
        res.put("state", state);
        res.put("hubName", hub);
        res.put("deliverySpeed", express ? "⚡ 1-Hour SuperFast Express Delivery" : "📦 Standard Pan-India (2-3 Days)");
        res.put("estimatedEta", express ? "45 - 60 minutes" : "2 Business Days");
        res.put("deliveryCharge", express ? 49 : 0);
        res.put("freeDeliveryThreshold", express ? 999 : 499);

        // Next delivery slot calculation
        LocalTime now = LocalTime.now();
        LocalTime deliveryBy = now.plusMinutes(55);
        res.put("targetDeliveryTime", deliveryBy.format(DateTimeFormatter.ofPattern("hh:mm a")));

        return res;
    }
}
