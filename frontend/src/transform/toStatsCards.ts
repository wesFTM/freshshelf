import type { Stats, StatsCards } from "@/types";

/** Formats counts and turns the waste ratio into a percent string. */
export function toStatsCards(stats: Stats): StatsCards {
  const percent = Math.round(stats.waste_rate * 100);
  return {
    active: String(stats.total_active),
    expiringSoon: String(stats.expiring_soon),
    expired: String(stats.expired),
    wasteRate: `${percent}%`,
  };
}