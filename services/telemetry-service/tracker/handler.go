package tracker

import (
	"encoding/json"
	"net/http"
	"strconv"
)

// APIHandler wraps HTTP routing for the spatial telemetry service
type APIHandler struct {
	tracker *SpatialTracker
}

// NewAPIHandler constructs a handler with an injected spatial tracker
func NewAPIHandler(tracker *SpatialTracker) *APIHandler {
	return &APIHandler{tracker: tracker}
}

// HealthCheckHandler returns service health status
func (h *APIHandler) HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"status":  "UP",
		"service": "quickcart-telemetry-service",
		"version": "1.0.0",
	})
}

// UpdateLocationHandler processes rider GPS coordinate snapshots
func (h *APIHandler) UpdateLocationHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RiderLocation
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload: "+err.Error(), http.StatusBadRequest)
		return
	}

	if req.DriverID == 0 {
		http.Error(w, "driverId is required", http.StatusBadRequest)
		return
	}

	h.tracker.UpdateLocation(req)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"driverId": req.DriverID,
		"message":  "GPS telemetry recorded",
	})
}

// FindNearbyDriversHandler finds available riders within a radius of target coordinates
func (h *APIHandler) FindNearbyDriversHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	latStr := r.URL.Query().Get("lat")
	lngStr := r.URL.Query().Get("lng")
	radStr := r.URL.Query().Get("radiusKm")
	limitStr := r.URL.Query().Get("limit")

	lat, err1 := strconv.ParseFloat(latStr, 64)
	lng, err2 := strconv.ParseFloat(lngStr, 64)
	if err1 != nil || err2 != nil {
		http.Error(w, "lat and lng query parameters are required and must be valid floats", http.StatusBadRequest)
		return
	}

	radiusKm := 10.0
	if radStr != "" {
		if val, err := strconv.ParseFloat(radStr, 64); err == nil && val > 0 {
			radiusKm = val
		}
	}

	limit := 10
	if limitStr != "" {
		if val, err := strconv.Atoi(limitStr); err == nil && val > 0 {
			limit = val
		}
	}

	candidates := h.tracker.FindNearbyRiders(lat, lng, radiusKm, limit)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"targetLatitude":  lat,
		"targetLongitude": lng,
		"radiusKm":        radiusKm,
		"candidateCount":  len(candidates),
		"drivers":         candidates,
	})
}
