import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { canTransitionPayment, mapPaymentStatus, NEXAPAYZ_HOST } from "./payment-rules";

const BASE = `https://${NEXAPAYZ_HOST}`;

export function publicPaymentClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Layanan pembayaran belum tersedia.");
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: {
    fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    },
  } });
}
export async function paymentKey() {
  const { storedPaymentKey } = await import("./payment-credentials.server");
  return await storedPaymentKey("live") ?? process.env["NEXAPAYZ_API_KEY"];
}
export async function digest(value: string, algorithm = "SHA-256") {
  const bytes = await crypto.subtle.digest(algorithm, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
}
export async function nexaFetch(path: string, params: Record<string, string>) {
  const key = await paymentKey();
  if (!key) throw new Error("Pembayaran belum diaktifkan oleh owner.");
  // Key goes in a header so it never appears in URLs or logs.
  const response = await fetch(`${BASE}${path}?${new URLSearchParams(params)}`, {
    headers: { "x-api-key": key, Accept: "application/json" }, signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error("NexaPayz belum dapat memproses permintaan. Coba lagi nanti.");
  return response.json();
}
export function safeCheckoutUrl(url: string) {
  try {
    const parsed = new URL(url, BASE);
    return parsed.protocol === "https:" && parsed.hostname === NEXAPAYZ_HOST ? parsed.toString() : null;
  } catch { return null; }
}
const invoiceStatus = z.object({ invoice_id: z.string(), amount: z.number(), status: z.string() });
export async function syncPaymentOrder(order: Database["public"]["Tables"]["payment_orders"]["Row"]) {
  if (!order.provider_invoice_id) return;
  const status = invoiceStatus.parse(await nexaFetch("/api/invoice/status", { id: order.provider_invoice_id }));
  if (status.invoice_id !== order.provider_invoice_id || status.amount !== order.amount) throw new Error("Status pembayaran belum dapat diverifikasi.");
  const next = mapPaymentStatus(status.status);
  if (next === order.status || !canTransitionPayment(order.status, next)) return;
  // Compare-and-set prevents a stale request overwriting a concurrent confirmed payment.
  const { error } = await supabaseAdmin.from("payment_orders").update({ status: next, payment_method: "qris", updated_at: new Date().toISOString() })
    .eq("id", order.id).eq("status", order.status).eq("updated_at", order.updated_at);
  if (error) throw new Error("Status pembayaran gagal disimpan.");
}
