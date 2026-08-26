package tracker

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
)

func TestHaversineDistance(t *testing.T) {
	// Bangalore Koramangala to Indiranagar (~4.5 km)
	lat1, lon1 := 12.9352, 77.6245
	lat2, lon2 := 12.9716, 77.6412

	dist := HaversineDistance(lat1, lon1, lat2, lon2)
	if dist < 4.0 || dist > 6.0 {
		t.Errorf("Expected distance between 4.0 and 6.0 km, got %f", dist)
	}
}

func TestSpatialTracker_ConcurrentUpdates(t *testing.T) {
	st := NewSpatialTracker()
	var wg sync.WaitGroup

	numGoroutines := 50
	for i := 1; i <= numGoroutines; i++ {
		wg.Add(1)
		driverID := int64(i)
		go func(id int64) {
			defer wg.Done()
			st.UpdateLocation(RiderLocation{
				DriverID:    id,
				Latitude:    12.9352 + float64(id)*0.001,
				Longitude:   77.6245 + float64(id)*0.001,
				IsAvailable: true,
				SpeedKmH:    22.5,
			})
		}(driverID)
	}
	wg.Wait()

	nearby := st.FindNearbyRiders(12.9352, 77.6245, 5.0, 10)
	if len(nearby) == 0 {
		t.Errorf("Expected at least 1 nearby rider, got %d", len(nearby))
	}
}

func TestAPIHandler_Endpoints(t *testing.T) {
	st := NewSpatialTracker()
	handler := NewAPIHandler(st)

	// 1. Health check
	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rr := httptest.NewRecorder()
	handler.HealthCheckHandler(rr, req)
	if rr.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rr.Code)
	}

	// 2. Post location
	loc := RiderLocation{
		DriverID:    101,
		Latitude:    12.9352,
		Longitude:   77.6245,
		IsAvailable: true,
	}
	body, _ := json.Marshal(loc)
	postReq := httptest.NewRequest(http.MethodPost, "/api/v1/telemetry/location", bytes.NewBuffer(body))
	postRr := httptest.NewRecorder()
	handler.UpdateLocationHandler(postRr, postReq)
	if postRr.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", postRr.Code)
	}

	// 3. Query nearby drivers
	getReq := httptest.NewRequest(http.MethodGet, "/api/v1/telemetry/nearby-drivers?lat=12.9350&lng=77.6240&radiusKm=2.0", nil)
	getRr := httptest.NewRecorder()
	handler.FindNearbyDriversHandler(getRr, getReq)
	if getRr.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", getRr.Code)
	}
}
