import type { FilterBarProps, StatusFilter } from "@/types";

const tabs: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fresh", label: "Fresh" },
  { id: "expiring", label: "Expiring" },
  { id: "expired", label: "Expired" },
];

export function FilterBar({ value, owners, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div role="group" aria-label="Status" className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const selected = value.status === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={selected}
              className={
                selected
                  ? "rounded-md bg-stone-900 px-3 py-2 text-sm font-medium text-white"
                  : "rounded-md bg-white px-3 py-2 text-sm font-medium text-stone-800 ring-1 ring-stone-300 hover:bg-stone-50"
              }
              onClick={() => onChange({ ...value, status: tab.id })}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="owner-filter" className="text-sm font-medium text-stone-700">
          Owner
        </label>
        <select
          id="owner-filter"
          className="rounded-md bg-white px-3 py-2 text-sm ring-1 ring-stone-300"
          value={value.owner}
          onChange={(event) => onChange({ ...value, owner: event.target.value })}
        >
          <option value="">All owners</option>
          {owners.map((owner) => (
            <option key={owner} value={owner}>
              {owner}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}