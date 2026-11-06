import { describe, expect, it } from "vitest";
import { canTransitionPayment, checkoutInput, mapPaymentStatus, paymentCanActivate } from "@/lib/payment-rules";

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
  it("validates buyer inputs before creating orders", () => {
    const input = { productId: "abaf0abf-62af-4709-a1c9-0a8ed1e1d24a", token: "abaf0abf-62af-4709-a1c9-0a8ed1e1d24b", buyerName: "Kenzo", whatsapp: "08123456789", minecraftName: "Kenzo_01" };
    expect(checkoutInput.safeParse(input).success).toBe(true);
    expect(checkoutInput.safeParse({ ...input, minecraftName: "<script>" }).success).toBe(false);
  });
});