import json
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client(tmp_path, monkeypatch):
    path = tmp_path / "items.json"
    monkeypatch.setenv("FRESHSHELF_DATA", str(path))
    return TestClient(app), path


def test_create_succeeds(client):
    api, path = client
    path.write_text("[]\n", encoding="utf-8")
    expires = date.today() + timedelta(days=2)

    response = api.post(
        "/items",
        json={
            "name": "Greek yogurt",
            "owner": "Priya",
            "category": "dairy",
            "quantity": 2,
            "expires_on": expires.isoformat(),
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert len(body["id"]) == 6
    assert body["state"] == "active"
    assert body["added_on"] == date.today().isoformat()
    assert body["days_left"] == 2
    assert body["status"] == "expiring"

    saved = json.loads(path.read_text(encoding="utf-8"))
    assert saved[0]["name"] == "Greek yogurt"
    assert "days_left" not in saved[0]
    assert "status" not in saved[0]


def test_bad_input_rejected(client):
    api, path = client
    path.write_text("[]\n", encoding="utf-8")

    response = api.post(
        "/items",
        json={
            "name": "   ",
            "owner": "Priya",
            "category": "snacks",
            "quantity": 0,
            "expires_on": (date.today() - timedelta(days=1)).isoformat(),
        },
    )

    assert response.status_code == 400
    errors = response.json()["fieldErrors"]
    assert "name" in errors
    assert "category" in errors
    assert "quantity" in errors
    assert "expires_on" in errors
    assert json.loads(path.read_text(encoding="utf-8")) == []


def test_patch_missing_id_returns_404(client):
    api, path = client
    path.write_text("[]\n", encoding="utf-8")

    response = api.patch("/items/missing", json={"state": "tossed"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Item not found"


def test_item_expiring_today_is_expired(client):
    api, path = client
    path.write_text("[]\n", encoding="utf-8")
    created = api.post(
        "/items",
        json={
            "name": "Milk",
            "owner": "Sam",
            "category": "dairy",
            "quantity": 1,
            "expires_on": date.today().isoformat(),
        },
    )
    assert created.status_code == 201
    assert created.json()["days_left"] == 0
    assert created.json()["status"] == "expired"


def test_used_item_leaves_the_list_and_counts_in_stats(client):
    api, path = client
    path.write_text(
        json.dumps(
            [
                {
                    "id": "a1b2c3",
                    "name": "Milk",
                    "owner": "Sam",
                    "category": "dairy",
                    "quantity": 1,
                    "added_on": "2026-09-01",
                    "expires_on": "2026-09-08",
                    "state": "active",
                }
            ]
        ),
        encoding="utf-8",
    )

    marked = api.patch("/items/a1b2c3", json={"state": "tossed"})
    assert marked.status_code == 200
    assert marked.json()["state"] == "tossed"

    listed = api.get("/items")
    assert listed.status_code == 200
    assert listed.json() == []

    stats = api.get("/stats").json()
    assert stats["total_active"] == 0
    assert stats["tossed"] == 1
    assert stats["used"] == 0
    assert stats["waste_rate"] == 1.0

    saved = json.loads(path.read_text(encoding="utf-8"))
    assert saved[0]["state"] == "tossed"
