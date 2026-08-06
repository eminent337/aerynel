"""Unit tests for Aerynel InSAR sidecar module."""

from fastapi.testclient import TestClient
from aerynel_server.app.main import app

client = TestClient(app)

def test_insar_status():
    resp = client.get("/insar/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ready"
    assert data["sbas_solver"] == "enabled"
    assert data["sites_monitored"] == 4

def test_insar_sites_list():
    resp = client.get("/insar/sites")
    assert resp.status_code == 200
    sites = resp.json()
    assert len(sites) == 4
    keys = [s["key"] for s in sites]
    assert "tema_oil_coast" in keys
    assert "obuasi_mine" in keys

def test_insar_inspect_pixel():
    resp = client.get("/insar/inspect?site_key=tema_oil_coast&lat=5.63&lon=-0.02")
    assert resp.status_code == 200
    data = resp.json()
    assert data["site_key"] == "tema_oil_coast"
    assert "velocity_mm_yr" in data
    assert len(data["time_series"]) == 31
    assert data["time_series"][0]["date"] == "2024-01-15"
