"use client";

import { useState } from "react";

import type { AddItemFormProps, FieldErrors, ItemDraft } from "@/types";

const emptyDraft: ItemDraft = {
  name: "",
  owner: "",
  category: "",
  quantity: "1",
  expires_on: "",
};

function fieldError(errors: FieldErrors, name: keyof ItemDraft) {
  const message = errors[name];
  if (!message) return null;
  return (
    <p id={`${name}-error`} role="alert" className="text-sm text-rose-800">
      {message}
    </p>
  );
}

export function AddItemForm({
  categories,
  fieldErrors,
  isSubmitting,
  onSubmit,
}: AddItemFormProps) {
  const [draft, setDraft] = useState<ItemDraft>(emptyDraft);

  function update<K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      className="grid gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-stone-200 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(draft);
      }}
    >
      <h2 className="text-lg font-semibold text-stone-900 sm:col-span-2">Add an item</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="item-name" className="text-sm font-medium text-stone-700">
          Name
        </label>
        <input
          id="item-name"
          className="rounded-md px-3 py-2 text-sm ring-1 ring-stone-300"
          value={draft.name}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "name-error" : undefined}
          onChange={(event) => update("name", event.target.value)}
        />
        {fieldError(fieldErrors, "name")}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="item-owner" className="text-sm font-medium text-stone-700">
          Owner
        </label>
        <input
          id="item-owner"
          className="rounded-md px-3 py-2 text-sm ring-1 ring-stone-300"
          value={draft.owner}
          aria-invalid={Boolean(fieldErrors.owner)}
          aria-describedby={fieldErrors.owner ? "owner-error" : undefined}
          onChange={(event) => update("owner", event.target.value)}
        />
        {fieldError(fieldErrors, "owner")}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="item-category" className="text-sm font-medium text-stone-700">
          Category
        </label>
        <select
          id="item-category"
          className="rounded-md bg-white px-3 py-2 text-sm ring-1 ring-stone-300"
          value={draft.category}
          aria-invalid={Boolean(fieldErrors.category)}
          aria-describedby={fieldErrors.category ? "category-error" : undefined}
          onChange={(event) => update("category", event.target.value)}
        >
          <option value="">Choose a category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
        {fieldError(fieldErrors, "category")}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="item-quantity" className="text-sm font-medium text-stone-700">
          Quantity
        </label>
        <input
          id="item-quantity"
          className="rounded-md px-3 py-2 text-sm ring-1 ring-stone-300"
          inputMode="numeric"
          value={draft.quantity}
          aria-invalid={Boolean(fieldErrors.quantity)}
          aria-describedby={fieldErrors.quantity ? "quantity-error" : undefined}
          onChange={(event) => update("quantity", event.target.value)}
        />
        {fieldError(fieldErrors, "quantity")}
      </div>

      <div className="flex flex-col gap-1 sm:col-span-2">
        <label htmlFor="item-expires" className="text-sm font-medium text-stone-700">
          Expires on
        </label>
        <input
          id="item-expires"
          type="date"
          className="rounded-md px-3 py-2 text-sm ring-1 ring-stone-300 sm:max-w-xs"
          value={draft.expires_on}
          aria-invalid={Boolean(fieldErrors.expires_on)}
          aria-describedby={fieldErrors.expires_on ? "expires_on-error" : undefined}
          onChange={(event) => update("expires_on", event.target.value)}
        />
        {fieldError(fieldErrors, "expires_on")}
      </div>

      {fieldErrors.body ? (
        <p role="alert" className="text-sm text-rose-800 sm:col-span-2">
          {fieldErrors.body}
        </p>
      ) : null}

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding…" : "Add item"}
        </button>
      </div>
    </form>
  );
}