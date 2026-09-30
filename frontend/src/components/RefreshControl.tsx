import type { RefreshControlProps } from "@/types";

export function RefreshControl({
  isRefreshing,
  lastUpdatedLabel,
  onRefresh,
}: RefreshControlProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="rounded-md bg-white px-3 py-2 text-sm font-medium text-stone-800 ring-1 ring-stone-300 hover:bg-stone-50 disabled:opacity-60"
        onClick={onRefresh}
        disabled={isRefreshing}
        aria-busy={isRefreshing}
      >
        {isRefreshing ? "Refreshing…" : "Refresh"}
      </button>
      {lastUpdatedLabel ? (
        <p className="text-sm text-stone-500" aria-live="polite">
          {lastUpdatedLabel}
        </p>
      ) : null}
    </div>
  );
}