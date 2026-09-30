/**
 * The only module that calls the backend.
 * UI components must not import this file. The shell does.
 * Requests go to /api, and Next.js rewrites that to FastAPI on port 8000.
 */

import type { Freshness, Item, ItemDraft, Stats } from "@/types";

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(messageFromBody(status, body));
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function messageFromBody(status: number, body: unknown): string {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
  }
  return `Request failed (${status})`;
}

async function parse<T>(response: Response): Promise<T> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (!response.ok) throw new ApiError(response.status, body);
  return body as T;
}

export function listItems(
  filter: { status?: Freshness; owner?: string },
  signal?: AbortSignal,
): Promise<Item[]> {
  const params = new URLSearchParams();
  if (filter.status) params.set("status", filter.status);
  if (filter.owner) params.set("owner", filter.owner);
  const query = params.toString();
  return fetch(`/api/items${query ? `?${query}` : ""}`, { signal }).then((response) =>
    parse<Item[]>(response),
  );
}

export function createItem(draft: ItemDraft): Promise<Item> {
  return fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: draft.name.trim(),
      owner: draft.owner.trim(),
      category: draft.category,
      quantity: Number(draft.quantity),
      expires_on: draft.expires_on,
    }),
  }).then((response) => parse<Item>(response));
}

export function markItem(id: string, state: "used" | "tossed"): Promise<Item> {
  return fetch(`/api/items/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
  }).then((response) => parse<Item>(response));
}

export function getStats(signal?: AbortSignal): Promise<Stats> {
  return fetch("/api/stats", { signal }).then((response) => parse<Stats>(response));
}