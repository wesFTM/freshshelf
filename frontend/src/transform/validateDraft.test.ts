import { describe, expect, it } from "vitest";

import { fieldErrorsFromServer, validateDraft } from "./validateDraft";

const valid = {
  name: "Milk",
  owner: "Sam",
  category: "dairy",
  quantity: "1",
  expires_on: "2026-10-02",
};

describe("validateDraft", () => {
  it("accepts a complete draft", () => {
    expect(validateDraft(valid, "2026-09-30")).toEqual({});
  });

  it("rejects a blank name, a bad quantity, and an expiry before today", () => {
    expect(
      validateDraft(
        { ...valid, name: "  ", quantity: "0", expires_on: "2026-09-29" },
        "2026-09-30",
      ),
    ).toMatchObject({
      name: "Name is required.",
      quantity: "Quantity must be a whole number of at least 1.",
      expires_on: "Expiry date cannot be before the day it was added.",
    });
  });

  it("maps a server fieldErrors object and ignores other bodies", () => {
    expect(fieldErrorsFromServer({ fieldErrors: { name: "Name is required." } })).toEqual({
      name: "Name is required.",
    });
    expect(fieldErrorsFromServer({ detail: "Item not found" })).toEqual({});
  });
});
    