import type { Freshness, Item, ItemRow, Tone } from "@/types";

function badgeLabel(daysLeft: number): string {
  if (daysLeft === 0) return "Expired today";
  if (daysLeft === -1) return "Expired yesterday";
  if (daysLeft < -1) return `Expired ${Math.abs(daysLeft)} days ago`;
  if (daysLeft === 1) return "Expires in 1 day";
  return `Expires in ${daysLeft} days`;
}

function toneFor(status: Freshness): Tone {
  if (status === "fresh") return "ok";
  if (status === "expiring") return "warn";
  return "danger";
}

function categoryLabel(category: string): string {
  if (!category) return "—";
  return category.charAt(0).toUpperCase() + category.slice(1);
}

/** API items become table rows, soonest expiry first, then name. */
export function toItemRows(items: Item[]): ItemRow[] {
  return [...items]
    .sort((a, b) => {
      if (a.days_left !== b.days_left) return a.days_left - b.days_left;
      return a.name.localeCompare(b.name);
    })
    .map((item) => ({
      id: item.id,
      name: item.name,
      ownerLabel: item.owner.trim() ? item.owner : "—",
      categoryLabel: categoryLabel(item.category),
      badgeLabel: badgeLabel(item.days_left),
      tone: toneFor(item.status),
    }));
}
