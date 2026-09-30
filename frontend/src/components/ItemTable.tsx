import type { ItemTableProps, Tone } from "@/types";

const toneClass: Record<Tone, string> = {
  ok: "bg-emerald-50 text-emerald-950 ring-emerald-200",
  warn: "bg-amber-50 text-amber-950 ring-amber-200",
  danger: "bg-rose-50 text-rose-950 ring-rose-200",
};

export function ItemTable({
  rows,
  isLoading,
  error,
  onMarkUsed,
  onMarkTossed,
}: ItemTableProps) {
  if (isLoading) {
    return <p className="text-sm text-stone-600">Loading items…</p>;
  }

  if (error) {
    return (
      <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-950">
        {error}
      </p>
    );
  }

  if (rows.length === 0) {
    return <p className="text-sm text-stone-600">Nothing in the fridge matches this filter.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-stone-200">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <caption className="sr-only">Items still in the fridge</caption>
        <thead className="border-b border-stone-200 text-stone-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Name
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Owner
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Category
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-stone-100 last:border-0">
              <th scope="row" className="px-4 py-3 font-medium text-stone-900">
                {row.name}
              </th>
              <td className="px-4 py-3 text-stone-700">{row.ownerLabel}</td>
              <td className="px-4 py-3 text-stone-700">{row.categoryLabel}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ${toneClass[row.tone]}`}
                >
                  {row.badgeLabel}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-stone-800 ring-1 ring-stone-300 hover:bg-stone-50"
                    onClick={() => onMarkUsed(row.id)}
                  >
                    Used
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-stone-800 ring-1 ring-stone-300 hover:bg-stone-50"
                    onClick={() => onMarkTossed(row.id)}
                  >
                    Tossed
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}