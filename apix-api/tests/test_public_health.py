def test_public_summary_no_auth(client):
    response = client.get("/api/public/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "latest_daily_index" in data
    assert "latest_monthly_index" in data
    assert "mom_change_pct" in data
    assert "yoy_change_pct" in data
    assert len(data["top_routes"]) > 0
    assert data["data_classification"] == "OPEN_GOVERNMENT_DATA_LICENSED"


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "database" in data
    assert "rate_limiter" in data
    assert "timestamp" in data


def test_metadata_routes(client, nso_headers):
    response = client.get("/api/metadata/routes", headers=nso_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["basket_coverage_share"] >= 0.60
    assert len(data["routes"]) >= 5


def test_metadata_methodology(client, rbi_headers):
    response = client.get("/api/metadata/methodology", headers=rbi_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["base_period"] == "2025-01-01=100"
    assert "Transport and Communication" in data["target_cpi_subgroup"]


def test_health_reports_actual_backend(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "connected" in data["database"]
    assert "connected" in data["rate_limiter"]
