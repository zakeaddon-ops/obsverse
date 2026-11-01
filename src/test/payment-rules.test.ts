import { describe, expect, it } from "vitest";
import { canTransitionPayment, checkoutInput, mapPaymentStatus, validPaymentAmount } from "@/lib/payment-rules";

describe("Automatic QRIS and e-wallet payments", () => {
  it("requires provider settlement before confirming payment", () => {
    expect(mapPaymentStatus("pending")).toBe("pending");
    expect(mapPaymentStatus("settlement")).toBe("paid");
    expect(mapPaymentStatus("capture", "challenge")).toBe("pending");
    expect(mapPaymentStatus("capture", "accept")).toBe("paid");
  });
  it("does not accept a different amount than the server price", () => {
    expect(validPaymentAmount(25000, "25000.00")).toBe(true);
    expect(validPaymentAmount(25000, "1.00")).toBe(false);
    expect(validPaymentAmount(0, "0.00")).toBe(false);
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