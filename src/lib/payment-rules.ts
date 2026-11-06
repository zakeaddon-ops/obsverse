import { z } from "zod";

export const checkoutInput = z.object({
  productId: z.string().uuid(), token: z.string().uuid(),
  buyerName: z.string().trim().min(2).max(80),
  whatsapp: z.string().trim().min(7).max(30),
  minecraftName: z.string().trim().min(3).max(16).regex(/^[A-Za-z0-9_]+$/),
});
export const orderInput = z.object({ id: z.string().uuid(), token: z.string().uuid() });
export const NEXAPAYZ_HOST = "nexapayz.alluffystore.my.id";
export type PaymentStatus = "creating" | "pending" | "paid" | "failed" | "cancelled" | "expired" | "refunded";
export function paymentCanActivate(enabled: boolean, keyAvailable: boolean, price?: number) {
  return enabled && keyAvailable && (price === undefined || (Number.isSafeInteger(price) && price > 0));
}
export function mapPaymentStatus(status: string): PaymentStatus {
  if (status === "paid") return "paid";
  if (status === "expired") return "expired";
  return "pending";
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