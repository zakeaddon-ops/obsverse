import { z } from "zod";

export const checkoutInput = z.object({
  productId: z.string().uuid(), token: z.string().uuid(),
  buyerName: z.string().trim().min(2).max(80),
  whatsapp: z.string().trim().min(7).max(30),
  minecraftName: z.string().trim().min(3).max(16).regex(/^[A-Za-z0-9_]+$/),
});
export const orderInput = z.object({ id: z.string().uuid(), token: z.string().uuid() });
export const providerStatus = z.object({
  order_id: z.string().uuid(), gross_amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  transaction_status: z.string(), fraud_status: z.string().optional(), payment_type: z.string().optional(),
});
export type PaymentStatus = "creating" | "pending" | "paid" | "failed" | "cancelled" | "expired" | "refunded";
export function mapPaymentStatus(status: string, fraud?: string): PaymentStatus {
  if (status === "settlement" || (status === "capture" && fraud === "accept")) return "paid";
  if (status === "refund" || status === "partial_refund") return "refunded";
  if (status === "deny" || fraud === "deny" || status === "failure") return "failed";
  if (status === "expire") return "expired";
  if (status === "cancel") return "cancelled";
  return "pending";
}
export function validPaymentAmount(expected: number, actual: string) {
  return Number.isSafeInteger(expected) && expected > 0 && Number(actual) === expected;
}
export function canTransitionPayment(current: string, next: PaymentStatus) {
  if (current === "refunded") return next === "refunded";
  if (current === "paid") return next === "paid" || next === "refunded";
  if (next === "pending") return current === "creating" || current === "pending";
  return true;
}
export const PAYMENT_LABELS: Record<string, string> = {
  creating: "Menyiapkan pembayaran", pending: "Menunggu pembayaran", paid: "Sudah dibayar",
  failed: "Pembayaran gagal", cancelled: "Dibatalkan", expired: "Kedaluwarsa", refunded: "Pengembalian dana",
};