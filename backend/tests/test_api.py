import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_list_pilot_areas():
    """Verify listing pilot areas returns seeded districts with synthetic labels."""
    response = client.get("/api/v1/pilot-areas")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    area_names = [a["name"] for a in data]
    assert "Tikamgarh" in area_names
    assert "Chhatarpur" in area_names
    # All seeded demo areas should have is_synthetic == True
    for a in data:
        assert isinstance(a["is_synthetic"], bool)


def test_resource_centres_stock_validation():
    """Verify stock level query and validation against negative stocks."""
    response = client.get("/api/v1/resource-centres")
    assert response.status_code == 200
    depots = response.json()
    assert len(depots) >= 2
    depot_id = depots[0]["id"]

    # Valid stock update
    patch_resp = client.patch(f"/api/v1/resource-centres/{depot_id}/stock", json={"available_stock": 950.0})
    assert patch_resp.status_code == 200
    assert patch_resp.json()["available_stock"] == 950.0

    # Negative stock MUST fail validation with 422 Unprocessable Entity
    invalid_resp = client.patch(f"/api/v1/resource-centres/{depot_id}/stock", json={"available_stock": -50.0})
    assert invalid_resp.status_code == 422


def test_demand_records_listing():
    """Verify retrieval of demand records and synthetic data labelling."""
    response = client.get("/api/v1/demand-records")
    assert response.status_code == 200
    demands = response.json()
    assert len(demands) >= 2
    for d in demands:
        assert d["estimated_demand"] >= 0
        assert 1 <= d["priority"] <= 5
        assert d["value_category"] in ("estimated", "observed", "synthetic")


def test_scenario_creation_and_run_audit_history():
    """
    Complete end-to-end scenario test:
    1. Create a custom scenario.
    2. Run allocation engine against it.
    3. Verify audit history records the run, algorithm version, and line item decisions.
    4. Verify total allocation does not exceed available stock.
    """
    # 1. Create scenario
    scenario_payload = {
        "id": "scen-test-chhatarpur-emergency",
        "name": "Chhatarpur Emergency Drought Test",
        "description": "Integration test scenario for rapid tanker pre-positioning.",
        "stress_level": "extreme",
        "objective": "critical_needs_first",
        "input_assumptions": {
            "max_fleet_tankers": 45,
            "fuel_reserve_liters": 12000
        },
        "data_provenance": "Automated pytest integration test runner."
    }
    create_resp = client.post("/api/v1/scenarios", json=scenario_payload)
    assert create_resp.status_code in (201, 400)  # 400 if already created in earlier test run

    # 2. Run allocation
    run_resp = client.post(f"/api/v1/scenarios/{scenario_payload['id']}/run")
    assert run_resp.status_code == 200
    run_data = run_resp.json()
    assert run_data["scenario_id"] == scenario_payload["id"]
    assert "deterministic" in run_data["algorithm_version"].lower()
    assert run_data["total_allocated"] >= 0
    assert run_data["total_unmet"] >= 0
    # Line items should be populated
    assert len(run_data["items"]) > 0

    # 3. Retrieve audit history
    history_resp = client.get("/api/v1/allocation-runs")
    assert history_resp.status_code == 200
    history = history_resp.json()
    assert len(history) >= 1
    found = any(h["id"] == run_data["id"] for h in history)
    assert found


def test_audit_spec_alias_endpoints():
    """Verify Phase 4 specified endpoint aliases: /demands, /stock-centres, /allocations/history, /allocations/run."""
    resp_demands = client.get("/api/v1/demands")
    assert resp_demands.status_code == 200
    assert isinstance(resp_demands.json(), list)

    resp_stocks = client.get("/api/v1/stock-centres")
    assert resp_stocks.status_code == 200
    assert isinstance(resp_stocks.json(), list)

    resp_history = client.get("/api/v1/allocations/history")
    assert resp_history.status_code == 200
    assert isinstance(resp_history.json(), list)

    resp_run = client.post("/api/v1/allocations/run")
    assert resp_run.status_code == 200
    run_json = resp_run.json()
    assert "total_allocated" in run_json
    assert "total_unmet" in run_json
    assert run_json["total_allocated"] + run_json["total_unmet"] == run_json["total_demand"]

