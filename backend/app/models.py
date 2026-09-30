"""Shapes stored in items.json and returned by the API.

`state` is what a person did to the item: active, used, or tossed.
`status` is not stored. It is computed from expires_on when we respond.
"""

from pydantic import BaseModel, Field

CATEGORIES = ("dairy", "produce", "meat", "leftovers", "drinks", "other")
ITEM_STATES = ("active", "used", "tossed")
MARK_STATES = ("used", "tossed")
STATUSES = ("fresh", "expiring", "expired")


class Item(BaseModel):
    id: str
    name: str
    owner: str
    category: str
    quantity: int
    added_on: str
    expires_on: str
    state: str


class ItemView(Item):
    days_left: int
    status: str


class Stats(BaseModel):
    total_active: int
    expiring_soon: int
    expired: int
    used: int
    tossed: int
    waste_rate: float = Field(
        description="tossed / (used + tossed), or 0 when nothing has been marked."
    )