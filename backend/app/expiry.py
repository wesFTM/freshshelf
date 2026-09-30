"""Expiry rules shared by the list and the stats.

days_left is the number of calendar days from today to expires_on.
Today is 0. A past date is negative.

0 or less is expired, including an item that expires today.
1, 2, or 3 is expiring.
4 or more is fresh.
"""

from datetime import date, datetime

EXPIRING_WITHIN_DAYS = 3


def parse_date(value: object) -> date | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None
    if parsed.isoformat() != value:
        return None
    return parsed


def days_left(expires_on: date, today: date) -> int:
    return (expires_on - today).days


def freshness(expires_on: date, today: date) -> str:
    remaining = days_left(expires_on, today)
    if remaining <= 0:
        return "expired"
    if remaining <= EXPIRING_WITHIN_DAYS:
        return "expiring"
    return "fresh"