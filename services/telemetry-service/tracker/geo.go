package tracker

import (
	"math"
	"sync"
	"time"
)

// EarthRadiusKm is the mean radius of the Earth in kilometers
const EarthRadiusKm = 6371.0

// RiderLocation represents a delivery partner's GPS coordinate snapshot
type RiderLocation struct {
	DriverID     int64     `json:"driverId"`
	Latitude     float64   `json:"latitude"`
	Longitude    float64   `json:"longitude"`
	Heading      float64   `json:"heading"`
	SpeedKmH     float64   `json:"speedKmH"`
	IsAvailable  bool      `json:"isAvailable"`
	LastUpdateAt time.Time `json:"lastUpdateAt"`
}

// NearbyDriverResult represents a calculated nearby driver candidate
type NearbyDriverResult struct {
	DriverID      int64   `json:"driverId"`
	Latitude      float64 `json:"latitude"`
	Longitude     float64 `json:"longitude"`
	DistanceKm    float64 `json:"distanceKm"`
	EstimatedMins int     `json:"estimatedMins"`
}

// SpatialTracker maintains concurrent in-memory rider geospatial telemetry
type SpatialTracker struct {
	mu     sync.RWMutex
	riders map[int64]RiderLocation
}

// NewSpatialTracker constructs a thread-safe telemetry tracker
func NewSpatialTracker() *SpatialTracker {
	return &SpatialTracker{
		riders: make(map[int64]RiderLocation),
	}
}

// UpdateLocation stores or updates a rider's real-time GPS coordinates
func (st *SpatialTracker) UpdateLocation(loc RiderLocation) {
	st.mu.Lock()
	defer st.mu.Unlock()

	loc.LastUpdateAt = time.Now().UTC()
	st.riders[loc.DriverID] = loc
}

// GetLocation retrieves a single rider's latest location
func (st *SpatialTracker) GetLocation(driverID int64) (RiderLocation, bool) {
	st.mu.RLock()
	defer st.mu.RUnlock()

	loc, exists := st.riders[driverID]
	return loc, exists
}

// FindNearbyRiders calculates candidate drivers within a radius (km) sorted by distance
func (st *SpatialTracker) FindNearbyRiders(targetLat, targetLng, radiusKm float64, limit int) []NearbyDriverResult {
	st.mu.RLock()
	defer st.mu.RUnlock()

	var results []NearbyDriverResult

	for _, rider := range st.riders {
		if !rider.IsAvailable {
			continue
		}

		dist := HaversineDistance(targetLat, targetLng, rider.Latitude, rider.Longitude)
		if dist <= radiusKm {
			// Estimate arrival time based on average urban speed (25 km/h) + 2 min prep
			etaMins := int(math.Ceil((dist / 25.0) * 60.0)) + 2

			results = append(results, NearbyDriverResult{
				DriverID:      rider.DriverID,
				Latitude:      rider.Latitude,
				Longitude:     rider.Longitude,
				DistanceKm:    math.Round(dist*100) / 100,
				EstimatedMins: etaMins,
			})
		}
	}

	// Simple insertion sort by distance
	for i := 0; i < len(results); i++ {
		for j := i + 1; j < len(results); j++ {
			if results[j].DistanceKm < results[i].DistanceKm {
				results[i], results[j] = results[j], results[i]
			}
		}
	}

	if limit > 0 && len(results) > limit {
		return results[:limit]
	}

	return results
}

// HaversineDistance calculates the great-circle distance between two GPS coordinates in kilometers
func HaversineDistance(lat1, lon1, lat2, lon2 float64) float64 {
	dLat := (lat2 - lat1) * (math.Pi / 180.0)
	dLon := (lon2 - lon1) * (math.Pi / 180.0)

	rLat1 := lat1 * (math.Pi / 180.0)
	rLat2 := lat2 * (math.Pi / 180.0)

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Sin(dLon/2)*math.Sin(dLon/2)*math.Cos(rLat1)*math.Cos(rLat2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return EarthRadiusKm * c
}
