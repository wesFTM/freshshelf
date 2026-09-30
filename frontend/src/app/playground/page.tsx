"use client";

import Link from "next/link";
import { useState } from "react";

import { AddItemForm } from "@/components/AddItemForm";
import { FilterBar } from "@/components/FilterBar";
import { ItemTable } from "@/components/ItemTable";
import { RefreshControl } from "@/components/RefreshControl";
import { StatsBar } from "@/components/StatsBar";
import { CATEGORIES, type FilterValue, type ItemDraft, type ItemRow } from "@/types";

const rows: ItemRow[] = [
  {
    id: "row-1",
    name: "Greek yogurt",
    ownerLabel: "Priya",
    categoryLabel: "Dairy",
    badgeLabel: "Expired yesterday",
    tone: "danger",
  },
  {
    id: "row-2",
    name: "Chicken thighs",
    ownerLabel: "Alex",
    categoryLabel: "Meat",
    badgeLabel: "Expires in 1 day",
    tone: "warn",
  },
  {
    id: "row-3",
    name: "Apples",
    ownerLabel: "Priya",
    categoryLabel: "Produce",
    badgeLabel: "Expires in 5 days",
    tone: "ok",
  },
];

const stats = {
  active: "6",
  expiringSoon: "2",
  expired: "1",
  wasteRate: "25%",
};

export default function PlaygroundPage() {
  const [filter, setFilter] = useState<FilterValue>({ status: "all", owner: "" });
  const [submitted, setSubmitted] = useState<ItemDraft | null>(null);
  const [refreshed, setRefreshed] = useState(0);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-8 sm:px-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">UI playground</h1>
        <p className="mt-1 text-stone-600">
          These components are rendered with fake props. Nothing on this page calls the API.
        </p>
        <Link href="/" className="mt-2 inline-block text-sm font-medium text-stone-600 underline">
          Back to the fridge
        </Link>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">StatsBar</h2>
        <StatsBar stats={stats} isLoading={false} />
        <StatsBar stats={null} isLoading />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">FilterBar</h2>
        <FilterBar
          value={filter}
          owners={["Alex", "Priya", "Sam"]}
          onChange={setFilter}
        />
        <p className="text-sm text-stone-600">
          Selected status: {filter.status}. Selected owner: {filter.owner || "All owners"}.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">ItemTable</h2>
        <ItemTable
          rows={rows}
          isLoading={false}
          error={null}
          onMarkUsed={() => undefined}
          onMarkTossed={() => undefined}
        />
        <ItemTable
          rows={[]}
          isLoading
          error={null}
          onMarkUsed={() => undefined}
          onMarkTossed={() => undefined}
        />
        <ItemTable
          rows={[]}
          isLoading={false}
          error={null}
          onMarkUsed={() => undefined}
          onMarkTossed={() => undefined}
        />
        <ItemTable
          rows={[]}
          isLoading={false}
          error="Could not load items."
          onMarkUsed={() => undefined}
          onMarkTossed={() => undefined}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">RefreshControl</h2>
        <RefreshControl
          isRefreshing={false}
          lastUpdatedLabel="Updated 2 min ago"
          onRefresh={() => setRefreshed((count) => count + 1)}
        />
        <RefreshControl
          isRefreshing
          lastUpdatedLabel="Updated just now"
          onRefresh={() => undefined}
        />
        <p className="text-sm text-stone-600">Refresh clicked {refreshed} times.</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">AddItemForm</h2>
        <AddItemForm
          categories={CATEGORIES}
          fieldErrors={{ name: "Name is required." }}
          isSubmitting={false}
          onSubmit={setSubmitted}
        />
        <AddItemForm
          categories={CATEGORIES}
          fieldErrors={{}}
          isSubmitting
          onSubmit={() => undefined}
        />
        {submitted ? (
          <p className="text-sm text-stone-600">
            Last submit: {submitted.name || "(blank name)"} / {submitted.category || "(no category)"}
          </p>
        ) : null}
      </section>
    </main>
  );
}