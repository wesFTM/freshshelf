import type { StatsBarProps } from "@/types";

const cards = [
  { key: "active", label: "Active" },
  { key: "expiringSoon", label: "Expiring soon" },
  { key: "expired", label: "Expired" },
  { key: "wasteRate", label: "Waste rate" },
] as const;

export function StatsBar({ stats, isLoading }: StatsBarProps) {
  return (
    <section aria-label="Fridge stats">
      <h2 className="sr-only">Stats</h2>
      {isLoading ? (
        <p className="text-sm text-stone-600">Loading stats…</p>
      ) : (
        <dl className="grid gap-3 sm:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.key}
              className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-stone-200"
            >
              <dt className="text-sm text-stone-500">{card.label}</dt>
              <dd className="mt-1 text-2xl font-semibold text-stone-900">
                {stats ? stats[card.key] : "—"}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
