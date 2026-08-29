package main

import (
	"log"
	"net/http"
	"os"

	"github.com/riya292100/quickcart/telemetry-service/tracker"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8085"
	}

	spatialTracker := tracker.NewSpatialTracker()
	handler := tracker.NewAPIHandler(spatialTracker)

	mux := http.NewServeMux()
	mux.HandleFunc("/health", handler.HealthCheckHandler)
	mux.HandleFunc("/healthz", handler.HealthCheckHandler)
	mux.HandleFunc("/ready", handler.HealthCheckHandler)
	mux.HandleFunc("/readyz", handler.HealthCheckHandler)
	mux.HandleFunc("/api/v1/telemetry/location", handler.UpdateLocationHandler)
	mux.HandleFunc("/api/v1/telemetry/nearby-drivers", handler.FindNearbyDriversHandler)

	log.Printf("🚀 QuickCart Go Spatial Telemetry Service running on port %s...", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("Fatal error starting server: %v", err)
	}
}
