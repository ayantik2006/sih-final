def test_get_route_fares_success(client, nso_headers):
    response = client.get("/api/routes/DEL-BOM/fares", headers=nso_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["pair"] == "DEL-BOM"
    assert "summary" in data
    assert "median_fare" in data["summary"]
    assert "iqr_spread" in data["summary"]
    assert "carrier_share" in data["summary"]

    assert len(data["fares"]) > 0
    first_fare = data["fares"][0]
    assert first_fare["origin"] == "DEL"
    assert first_fare["destination"] == "BOM"
    assert "base_fare" in first_fare
    assert "taxes_udf" in first_fare
    assert "total_fare" in first_fare
    assert first_fare["audit_hash"].startswith("sha256:")


def test_get_route_fares_filter_airline(client, rbi_headers):
    response = client.get("/api/routes/DEL-BOM/fares?airline=IndiGo", headers=rbi_headers)
    assert response.status_code == 200
    data = response.json()
    for f in data["fares"]:
        assert f["carrier"] == "IndiGo"


def test_get_route_fares_filter_window(client, nso_headers):
    response = client.get("/api/routes/DEL-BOM/fares?window=T+7", headers=nso_headers)
    assert response.status_code == 200
    data = response.json()
    for f in data["fares"]:
        assert f["advance_purchase_days"] == 7


def test_get_route_fares_pagination(client, nso_headers):
    response = client.get("/api/routes/DEL-BOM/fares?limit=2&offset=0", headers=nso_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["fares"]) == 2
    assert data["limit"] == 2
    assert data["offset"] == 0


def test_get_route_fares_unknown_route(client, nso_headers):
    response = client.get("/api/routes/XYZ-ABC/fares", headers=nso_headers)
    assert response.status_code == 404
    data = response.json()
    assert data["type"] == "https://errors.apix.mospi.gov.in/route-not-found"
    assert data["status"] == 404
