import { describe, expect, it } from "vitest";

import { toStatsCards } from "./toStatsCards";

describe("toStatsCards", () => {
  it("turns the waste ratio into a rounded percent", () => {
    expect(
      toStatsCards({
        total_active: 6,
        expiring_soon: 2,
        expired: 1,
        used: 3,
        tossed: 1,
        waste_rate: 0.25,
      }),
    ).toEqual({
      active: "6",
      expiringSoon: "2",
      expired: "1",
      wasteRate: "25%",
    });
  });

  it("shows 0% when nothing has been used or tossed", () => {
    expect(
      toStatsCards({
        total_active: 10,
        expiring_soon: 3,
        expired: 3,
        used: 0,
        tossed: 0,
        waste_rate: 0,
      }).wasteRate,
    ).toBe("0%");
  });
});
