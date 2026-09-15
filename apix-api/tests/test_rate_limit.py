def test_rate_limit_headers_present_public(client):
    response = client.get("/api/public/summary")
    assert response.status_code == 200
    assert "x-ratelimit-limit" in response.headers
    assert response.headers["x-ratelimit-limit"] == "30"
    assert "x-ratelimit-remaining" in response.headers
    assert "x-ratelimit-reset" in response.headers
    assert "x-ratelimit-backend" in response.headers


def test_rate_limit_headers_present_authenticated(client, nso_headers):
    response = client.get("/api/index/daily", headers=nso_headers)
    assert response.status_code == 200
    assert "x-ratelimit-limit" in response.headers
    assert response.headers["x-ratelimit-limit"] == "600"
    assert "x-ratelimit-remaining" in response.headers
