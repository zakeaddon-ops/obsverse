import { describe, expect, it } from "vitest";
import { requireOwnerMembership } from "../lib/owner-rules";

describe("owner-only payment configuration", () => {
  it("rejects an ordinary admin without owner membership", () => {
    expect(() => requireOwnerMembership(false)).toThrow("Hanya owner");
  });
  it("permits the designated owner membership", () => {
    expect(() => requireOwnerMembership(true)).not.toThrow();
  });
});