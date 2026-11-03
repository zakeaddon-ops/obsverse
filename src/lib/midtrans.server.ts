import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { canTransitionPayment, mapPaymentStatus, providerStatus, validPaymentAmount } from "./payment-rules";

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
export async function midtransKey(environment: string) {
  const { storedPaymentKey } = await import("./payment-credentials.server");
  return await storedPaymentKey(environment) ?? (environment === "live" ? process.env["MIDTRANS_LIVE_SERVER_KEY"] : process.env["MIDTRANS_SANDBOX_SERVER_KEY"]);
}
export async function digest(value: string, algorithm = "SHA-256") {
  const bytes = await crypto.subtle.digest(algorithm, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
}
export function equalDigest(a: string, b: string) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}
export async function midtransFetch(environment: string, path: string, payload?: unknown) {
  const key = await midtransKey(environment);
  if (!key) throw new Error("Pembayaran belum diaktifkan oleh admin.");
  const host = payload ? (environment === "live" ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com") : (environment === "live" ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com");
  const response = await fetch(host + path, {
    method: payload ? "POST" : "GET",
    headers: { Authorization: `Basic ${btoa(key + ":")}`, "Content-Type": "application/json", Accept: "application/json" },
    body: payload ? JSON.stringify(payload) : null, signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error("Midtrans belum dapat memproses permintaan. Coba lagi nanti.");
  return response.json();
}
export function safeCheckoutUrl(url: string, environment: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === (environment === "live" ? "app.midtrans.com" : "app.sandbox.midtrans.com") ? url : null;
  } catch { return null; }
}
export async function syncPaymentOrder(order: Database["public"]["Tables"]["payment_orders"]["Row"]) {
  const status = providerStatus.parse(await midtransFetch(order.environment, `/v2/${order.id}/status`));
  if (status.order_id !== order.id || !validPaymentAmount(order.amount, status.gross_amount)) throw new Error("Status pembayaran belum dapat diverifikasi.");
  const next = mapPaymentStatus(status.transaction_status, status.fraud_status);
  if (!canTransitionPayment(order.status, next)) return;
  // Compare-and-set prevents a stale request overwriting a concurrent confirmed payment.
  const { error } = await supabaseAdmin.from("payment_orders").update({
    status: next, payment_method: status.payment_type ?? null, updated_at: new Date().toISOString(),
  }).eq("id", order.id).eq("status", order.status).eq("updated_at", order.updated_at);
  if (error) throw new Error("Status pembayaran gagal disimpan.");
}