import { describe, expect, it } from "vitest";

import type { Item } from "@/types";
import { toItemRows } from "./toItemRows";

function item(overrides: Partial<Item>): Item {
  return {
    id: "a1b2c3",
    name: "Milk",
    owner: "Sam",
    category: "dairy",
    quantity: 1,
    added_on: "2026-09-01",
    expires_on: "2026-09-30",
    state: "active",
    days_left: 4,
    status: "fresh",
    ...overrides,
  };
}

describe("toItemRows", () => {
  it("sorts soonest expiry first, then name, and builds badge text", () => {
    const rows = toItemRows([
      item({ id: "1", name: "Apples", days_left: 5, status: "fresh" }),
      item({ id: "2", name: "Yogurt", days_left: 0, status: "expired" }),
      item({ id: "3", name: "Bread", owner: "", days_left: 1, status: "expiring" }),
      item({ id: "4", name: "Milk", days_left: 0, status: "expired" }),
    ]);

    expect(rows.map((row) => row.name)).toEqual(["Milk", "Yogurt", "Bread", "Apples"]);
    expect(rows[0]).toMatchObject({ badgeLabel: "Expired today", tone: "danger" });
    expect(rows[1]).toMatchObject({ badgeLabel: "Expired today", tone: "danger" });
    expect(rows[2]).toMatchObject({
      badgeLabel: "Expires in 1 day",
      tone: "warn",
      ownerLabel: "—",
    });
    expect(rows[3]).toMatchObject({ badgeLabel: "Expires in 5 days", tone: "ok" });
  });

  it("uses yesterday and plural day counts", () => {
    const rows = toItemRows([
      item({ id: "1", name: "Spinach", days_left: -1, status: "expired" }),
      item({ id: "2", name: "Juice", days_left: 3, status: "expiring" }),
      item({ id: "3", name: "Sauce", days_left: -4, status: "expired" }),
    ]);

    expect(rows.map((row) => row.badgeLabel)).toEqual([
      "Expired 4 days ago",
      "Expired yesterday",
      "Expires in 3 days",
    ]);
  });
});