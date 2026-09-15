def test_protected_endpoint_missing_auth(client):
    response = client.get("/api/index/daily")
    assert response.status_code == 401
    data = response.json()
    assert data["type"] == "https://errors.apix.mospi.gov.in/missing-api-key"
    assert "detail" in data
    assert data["status"] == 401


def test_protected_endpoint_invalid_key(client):
    response = client.get("/api/index/daily", headers={"X-API-Key": "invalid-hacker-key"})
    assert response.status_code == 401
    data = response.json()
    assert data["type"] == "https://errors.apix.mospi.gov.in/invalid-api-key"


def test_protected_endpoint_valid_nso_key(client, nso_headers):
    response = client.get("/api/index/daily", headers=nso_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "success"


def test_protected_endpoint_valid_bearer_rbi(client, rbi_headers):
    response = client.get("/api/index/daily", headers=rbi_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "success"


def test_query_param_key_auth(client):
    response = client.get("/api/index/daily?api_key=mospi-nso-key-2026")
    assert response.status_code == 200
    assert response.json()["status"] == "success"
