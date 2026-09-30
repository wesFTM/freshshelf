"""JSON file used as the database.
The file is created once, with 10 items dated from the day it is created.
Later startups read whatever is there. They do not reseed.
"""

import json
import os
import secrets
import threading
from datetime import date, timedelta
from pathlib import Path

from app.expiry import days_left, freshness

DEFAULT_PATH = Path(__file__).resolve().parent.parent / "data" / "items.json"
_lock = threading.Lock()

# name, owner, category, quantity, days from today until expires_on
SEED_ROWS = (
    ("Greek yogurt", "Priya", "dairy", 2, -3),
    ("Baby spinach", "Priya", "produce", 1, -1),
    ("Milk", "Sam", "dairy", 1, 0),
    ("Chicken thighs", "Alex", "meat", 1, 1),
    ("Leftover pasta", "Sam", "leftovers", 1, 2),
    ("Orange juice", "Jordan", "drinks", 1, 3),
    ("Apples", "Priya", "produce", 4, 5),
    ("Cheddar", "Alex", "dairy", 1, 12),
    ("Seltzer", "Jordan", "drinks", 6, 21),
    ("Hot sauce", "Sam", "other", 1, 60),
)

class NotFound(Exception):
    pass


def data_path() -> Path:
    override = os.environ.get("FRESHSHELF_DATA")
    if override:
        return Path(override)
    return DEFAULT_PATH


def _seed_items(today: date) -> list[dict]:
    items = []
    for index, (name, owner, category, quantity, offset) in enumerate(SEED_ROWS, start=1):
        expires = today + timedelta(days=offset)
        added = expires - timedelta(days=7)
        items.append(
            {
                "id": f"seed{index:02d}",
                "name": name,
                "owner": owner,
                "category": category,
                "quantity": quantity,
                "added_on": added.isoformat(),
                "expires_on": expires.isoformat(),
                "state": "active",
            }
        )
    return items


def _write_unlocked(path: Path, items: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(items, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def _read_unlocked(path: Path) -> list[dict]:
    if not path.exists():
        items = _seed_items(date.today())
        _write_unlocked(path, items)
        return items
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        raise ValueError(f"{path} must contain a JSON list")
    return raw


def load_items() -> list[dict]:
    with _lock:
        return _read_unlocked(data_path())


def update_items(mutator):
    """Read, change, and write the file while holding one lock."""
    with _lock:
        path = data_path()
        items = _read_unlocked(path)
        result = mutator(items)
        _write_unlocked(path, items)
        return result


def new_id(items: list[dict]) -> str:
    taken = {item.get("id") for item in items}
    while True:
        candidate = secrets.token_hex(3)
        if candidate not in taken:
            return candidate


def to_view(item: dict, today: date | None = None) -> dict:
    current = today or date.today()
    expires = date.fromisoformat(item["expires_on"])
    return {
        **item,
        "days_left": days_left(expires, current),
        "status": freshness(expires, current),
    }
