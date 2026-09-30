import { CATEGORIES, type FieldErrors, type ItemDraft } from "@/types";

const categorySet = new Set<string>(CATEGORIES);

/** Local calendar date as YYYY-MM-DD. Matches the backend's date.today(). */
export function localToday(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function validateDraft(draft: ItemDraft, today: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!draft.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!categorySet.has(draft.category)) {
    errors.category = "Choose dairy, produce, meat, leftovers, drinks, or other.";
  }

  if (!/^\d+$/.test(draft.quantity.trim()) || Number(draft.quantity) < 1) {
    errors.quantity = "Quantity must be a whole number of at least 1.";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.expires_on)) {
    errors.expires_on = "Use a date in YYYY-MM-DD.";
  } else if (draft.expires_on < today) {
    errors.expires_on = "Expiry date cannot be before the day it was added.";
  }

  return errors;
}

/** Copies a 400 fieldErrors object onto the form. Ignores anything else. */
export function fieldErrorsFromServer(body: unknown): FieldErrors {
  if (!body || typeof body !== "object" || !("fieldErrors" in body)) return {};
  const raw = (body as { fieldErrors: unknown }).fieldErrors;
  if (!raw || typeof raw !== "object") return {};

  const errors: FieldErrors = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") {
      errors[key as keyof FieldErrors] = value;
    }
  }
  return errors;
}