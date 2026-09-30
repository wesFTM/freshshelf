"""HTTP API over the JSON store.
GET /items lists state=active only. status and owner narrow that list.
Used and tossed rows stay in the file so GET /stats can count them.
"""

from datetime import date

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.expiry import parse_date
from app.models import CATEGORIES, MARK_STATES, STATUSES, Stats
from app.store import NotFound, load_items, new_id, to_view, update_items

router = APIRouter()


ef _field_errors(errors: dict[str, str]) -> JSONResponse:
    return JSONResponse(status_code=400, content={"fieldErrors": errors})


def validate_create(payload: dict) -> dict[str, str]:
    errors: dict[str, str] = {}

    name = payload.get("name")
    if not isinstance(name, str) or not name.strip():
        errors["name"] = "Name is required."

    owner = payload.get("owner", "")
    if owner is None:
        owner = ""
    if not isinstance(owner, str):
        errors["owner"] = "Owner must be text."

    category = payload.get("category")
    if category not in CATEGORIES:
        errors["category"] = "Choose dairy, produce, meat, leftovers, drinks, or other."

    quantity = payload.get("quantity")
    if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1:
        errors["quantity"] = "Quantity must be a whole number of at least 1."
    
    expires = parse_date(payload.get("expires_on"))
    if expires is None:
        errors["expires_on"] = "Use a date in YYYY-MM-DD."
    elif expires < date.today():
        errors["expires_on"] = "Expiry date cannot be before the day it was added."

    return errors


def validate_patch(payload: dict) -> dict[str, str]:
    state = payload.get("state")
    if state not in MARK_STATES:
        return {"state": "State must be used or tossed."}
    return {}


@router.get("/items")
def list_items(status: str | None = None, owner: str | None = None):
    if status is not None and status not in STATUSES:
        return _field_errors(
            {"status": "Status must be fresh, expiring, or expired."}
        )
    views = []
    for item in load_items():
        if item.get("state") != "active":
            continue
        view = to_view(item)
        if status is not None and view["status"] != status:
            continue
        if owner is not None and item.get("owner") != owner:
            continue
        views.append(view)
    return views


@router.post("/items")
async def create_item(request: Request):
    try:
        payload = await request.json()
    except Exception:
        payload = None
    if not isinstance(payload, dict):
        return _field_errors({"body": "Expected a JSON object."})
    errors = validate_create(payload)
    if errors:
        return _field_errors(errors)
    def add(items: list[dict]) -> dict:
        item = {
            "id": new_id(items),
            "name": payload["name"].strip(),
            "owner": str(payload.get("owner") or "").strip(),
            "category": payload["category"],
            "quantity": payload["quantity"],
            "added_on": date.today().isoformat(),
            "expires_on": payload["expires_on"],
            "state": "active",
        }
        items.append(item)
        return item
    created = update_items(add)
    return JSONResponse(status_code=201, content=to_view(created))


@router.patch("/items/{item_id}")
async def mark_item(item_id: str, request: Request):
    try:
        payload = await request.json()
    except Exception:
        payload = None
    if not isinstance(payload, dict):
        return _field_errors({"body": "Expected a JSON object."})
    errors = validate_patch(payload)
    if errors:
        return _field_errors(errors)
    def mark(items: list[dict]) -> dict:
        for item in items:
            if item.get("id") == item_id:
                item["state"] = payload["state"]
                return dict(item)
        raise NotFound()
    try:
        updated = update_items(mark)
    except NotFound:
        return JSONResponse(status_code=404, content={"detail": "Item not found"})
    return to_view(updated)


@router.get("/stats")
def get_stats():
    active = 0
    expiring_soon = 0
    expired = 0
    used = 0
    tossed = 0
    for item in load_items():
        state = item.get("state")
        if state == "used":
            used += 1
            continue
        if state == "tossed":
            tossed += 1
            continue
        if state != "active":
            continue
        active += 1
        status = to_view(item)["status"]
        if status == "expiring":
            expiring_soon += 1
        elif status == "expired":
            expired += 1
    denominator = used + tossed
    waste_rate = (tossed / denominator) if denominator else 0.0
    return Stats(
        total_active=active,
        expiring_soon=expiring_soon,
        expired=expired,
        used=used,
        tossed=tossed,
        waste_rate=waste_rate,
    )





