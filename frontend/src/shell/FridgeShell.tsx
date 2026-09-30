"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError, createItem, getStats, listItems, markItem } from "@/api/items";
import { AddItemForm } from "@/components/AddItemForm";
import { FilterBar } from "@/components/FilterBar";
import { ItemTable } from "@/components/ItemTable";
import { RefreshControl } from "@/components/RefreshControl";
import { StatsBar } from "@/components/StatsBar";
import { toItemRows } from "@/transform/toItemRows";
import { toOwnerOptions } from "@/transform/toOwnerOptions";
import { toStatsCards } from "@/transform/toStatsCards";
import { toUpdatedLabel } from "@/transform/toUpdatedLabel";
import {
  fieldErrorsFromServer,
  localToday,
  validateDraft,
} from "@/transform/validateDraft";
import {
  CATEGORIES,
  type FieldErrors,
  type FilterValue,
  type ItemDraft,
  type ItemRow,
  type StatsCards,
} from "@/types";

function isAbort(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function loadErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Could not reach the fridge API. Start the backend on port 8000.";
}

export function FridgeShell() {
  const [filter, setFilter] = useState<FilterValue>({ status: "all", owner: "" });
  const [rows, setRows] = useState<ItemRow[]>([]);
  const [stats, setStats] = useState<StatsCards | null>(null);
  const [owners, setOwners] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [formKey, setFormKey] = useState(0);

  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const filterRef = useRef(filter);
  filterRef.current = filter;

  const load = useCallback(async (kind: "initial" | "refresh") => {
    const id = ++requestId.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const currentFilter = filterRef.current;

    if (kind === "initial") setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const status = currentFilter.status === "all" ? undefined : currentFilter.status;
      const [items, ownerSource, statsRaw] = await Promise.all([
        listItems({ status, owner: currentFilter.owner }, controller.signal),
        listItems({}, controller.signal),
        getStats(controller.signal),
      ]);
      if (controller.signal.aborted || id !== requestId.current) return;
      setRows(toItemRows(items));
      setOwners(toOwnerOptions(ownerSource, currentFilter.owner));
      setStats(toStatsCards(statsRaw));
      setError(null);
      setLastUpdated(new Date());
      setNow(new Date());
    } catch (error) {
      if (isAbort(error) || id !== requestId.current) return;
      setError(loadErrorMessage(error));
    } finally {
      if (id === requestId.current && !controller.signal.aborted) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void load("initial");
    const timer = window.setInterval(() => {
      void load("refresh");
    }, 60_000);
    return () => {
      window.clearInterval(timer);
      abortRef.current?.abort();
    };
  }, [load, filter]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  async function onSubmit(draft: ItemDraft) {
    const errors = validateDraft(draft, localToday());
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setIsSubmitting(true);
    setFieldErrors({});
    try {
      await createItem(draft);
      setFormKey((key) => key + 1);
      await load("refresh");
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        const mapped = fieldErrorsFromServer(error.body);
        setFieldErrors(Object.keys(mapped).length > 0 ? mapped : { body: error.message });
        return;
      }
      if (!isAbort(error)) setError(loadErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function mark(id: string, state: "used" | "tossed") {
    try {
      await markItem(id, state);
      await load("refresh");
    } catch (error) {
      if (!isAbort(error)) setError(loadErrorMessage(error));
    }
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">FreshShelf</h1>
          <p className="mt-1 text-stone-600">What’s in the fridge, and what’s about to go.</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <RefreshControl
            isRefreshing={isRefreshing}
            lastUpdatedLabel={toUpdatedLabel(lastUpdated, now)}
            onRefresh={() => {
              void load("refresh");
            }}
          />
          <Link href="/playground" className="text-sm font-medium text-stone-600 underline">
            UI playground
          </Link>
        </div>
      </header>

      <StatsBar stats={stats} isLoading={isLoading && stats === null} />
      <FilterBar value={filter} owners={owners} onChange={setFilter} />
      <ItemTable
        rows={rows}
        isLoading={isLoading}
        error={error}
        onMarkUsed={(id) => {
          void mark(id, "used");
        }}
        onMarkTossed={(id) => {
          void mark(id, "tossed");
        }}
      />
      <AddItemForm
        key={formKey}
        categories={CATEGORIES}
        fieldErrors={fieldErrors}
        isSubmitting={isSubmitting}
        onSubmit={(draft) => {
          void onSubmit(draft);
        }}
      />
    </main>
  );
}
