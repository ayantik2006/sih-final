def test_get_dgca_backtest(client, rbi_headers):
    response = client.get("/api/backtest/dgca-comparison?days=30", headers=rbi_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "period" in data
    assert "metrics" in data
    assert "series" in data

    metrics = data["metrics"]
    assert metrics["pearson_r"] >= 0.80, f"Expected Pearson r >= 0.80, got {metrics['pearson_r']}"
    assert metrics["mape"] <= 5.0, f"Expected MAPE <= 5.0%, got {metrics['mape']}"
    assert metrics["rmse"] > 0
    assert metrics["target_met"] is True

    assert len(data["series"]) == 30
    first_pt = data["series"][0]
    assert "date" in first_pt
    assert "apix_index" in first_pt
    assert "dgca_avg_fare" in first_pt


def test_backtest_variance_matches_mape(client, nso_headers):
    response = client.get("/api/backtest/dgca-comparison?days=30", headers=nso_headers)
    assert response.status_code == 200
    data = response.json()
    series = data["series"]
    variances = [pt["variance_pct"] for pt in series]
    mean_variance = sum(variances) / len(variances)
    reported_mape = data["metrics"]["mape"]
    assert abs(mean_variance - reported_mape) <= 0.01, f"mean(variance_pct)={mean_variance} != mape={reported_mape}"
