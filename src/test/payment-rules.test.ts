import { describe, expect, it } from "vitest";
import { canTransitionPayment, checkoutInput, formatCountdown, mapPaymentStatus, paymentCanActivate, paymentSecondsLeft, PAYMENT_WINDOW_MS } from "@/lib/payment-rules";

describe("Automatic QRIS and e-wallet payments", () => {
  it("keeps payments disabled until the provider key is available", () => {
    expect(paymentCanActivate(true, false, 25000)).toBe(false);
    expect(paymentCanActivate(true, true, 25000)).toBe(true);
    expect(paymentCanActivate(false, true, 25000)).toBe(false);
  });
  it("requires a positive whole-rupiah price", () => {
    expect(paymentCanActivate(true, true, 0)).toBe(false);
    expect(paymentCanActivate(true, true, 25000.5)).toBe(false);
  });
  it("only confirms payment when NexaPayz reports paid", () => {
    expect(mapPaymentStatus("pending")).toBe("pending");
    expect(mapPaymentStatus("paid")).toBe("paid");
    expect(mapPaymentStatus("expired")).toBe("expired");
    expect(mapPaymentStatus("anything")).toBe("pending");
  });
  it("does not revert confirmed payments when old notifications arrive", () => {
    expect(canTransitionPayment("paid", "pending")).toBe(false);
    expect(canTransitionPayment("paid", "failed")).toBe(false);
    expect(canTransitionPayment("paid", "refunded")).toBe(true);
    expect(canTransitionPayment("refunded", "paid")).toBe(false);
  });
  it("counts down a 15-minute payment window and never goes negative", () => {
    const created = new Date("2026-11-07T04:00:00Z").toISOString();
    const start = Date.parse("2026-11-07T04:00:00Z");
    expect(PAYMENT_WINDOW_MS).toBe(15 * 60_000);
    expect(paymentSecondsLeft(created, start)).toBe(900);
    expect(paymentSecondsLeft(created, start + 5 * 60_000)).toBe(600);
    expect(paymentSecondsLeft(created, start + 15 * 60_000)).toBe(0);
    expect(paymentSecondsLeft(created, start + 60 * 60_000)).toBe(0);
  });
  it("formats the countdown as MM:SS", () => {
    expect(formatCountdown(900)).toBe("15:00");
    expect(formatCountdown(65)).toBe("01:05");
    expect(formatCountdown(0)).toBe("00:00");
  });
  it("validates buyer inputs before creating orders", () => {
    const input = { productId: "abaf0abf-62af-4709-a1c9-0a8ed1e1d24a", token: "abaf0abf-62af-4709-a1c9-0a8ed1e1d24b", buyerName: "Kenzo", whatsapp: "08123456789", minecraftName: "Kenzo_01" };
    expect(checkoutInput.safeParse(input).success).toBe(true);
    expect(checkoutInput.safeParse({ ...input, minecraftName: "<script>" }).success).toBe(false);
  });
});