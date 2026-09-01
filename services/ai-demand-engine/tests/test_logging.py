"""
Unit tests for structured logging middleware in QuickCart AI Demand Engine.
"""
from fastapi.testclient import TestClient
import structlog
from app.main import app

client = TestClient(app)


def test_structured_logging_captures_request_id_and_status():
    """Verify that HTTP middleware logs structured events with request_id and status fields."""
    with structlog.testing.capture_logs() as log_output:
        test_req_id = "req-test-trace-998877"
        response = client.get("/healthz", headers={"X-Request-ID": test_req_id})

        assert response.status_code == 200
        assert response.headers.get("X-Request-ID") == test_req_id

        # Verify structured log event fields
        matching = [
            event for event in log_output
            if event.get("request_id") == test_req_id
        ]
        assert len(matching) >= 1, f"Expected log event with request_id={test_req_id} in {log_output}"
        entry = matching[0]
        assert entry.get("request_id") == test_req_id
        assert entry.get("status") == 200
        assert entry.get("path") == "/healthz"
        assert "duration_ms" in entry


def test_structured_logging_generates_request_id_when_header_omitted():
    """Verify that a request_id is automatically generated and logged when not provided."""
    with structlog.testing.capture_logs() as log_output:
        response = client.get("/healthz")
        assert response.status_code == 200
        generated_id = response.headers.get("X-Request-ID")
        assert generated_id is not None

        matching = [
            event for event in log_output
            if event.get("request_id") == generated_id
        ]
        assert len(matching) == 1
        assert matching[0].get("status") == 200
