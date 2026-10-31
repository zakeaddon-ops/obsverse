import { describe, expect, it } from "vitest";
import { normalizeWhatsApp, safeWhatsApp } from "@/lib/whatsapp";

describe("Store WhatsApp", () => {
  it("does not invent a destination when no number is supplied", () => {
    expect(normalizeWhatsApp("")).toBe("");
    expect(safeWhatsApp(null)).toBe("");
  });
  it("normalizes an admin-entered Indonesian number", () => {
    expect(normalizeWhatsApp("0812 3456 7890")).toBe("https://wa.me/6281234567890");
    expect(normalizeWhatsApp("+62 812-3456-7890")).toBe("https://wa.me/6281234567890");
  });
  it("preserves a valid WhatsApp destination", () => {
    expect(normalizeWhatsApp("https://wa.me/6281234567890")).toBe("https://wa.me/6281234567890");
  });
  it("rejects unrelated links rather than exposing them as contact links", () => {
    expect(() => normalizeWhatsApp("https://discord.gg/example")).toThrow();
    expect(safeWhatsApp("javascript:alert(1)")).toBe("");
  });
});