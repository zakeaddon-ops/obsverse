import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checkoutInput, orderInput } from "./payment-rules";
import { normalizeWhatsApp } from "./whatsapp";

export const getPaymentAvailability = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "no-store");
  const { publicPaymentClient, midtransKey } = await import("./midtrans.server");
  const { data, error } = await publicPaymentClient().from("payment_settings").select("enabled,environment").eq("id", 1).maybeSingle();
  if (error) throw new Error("Pengaturan pembayaran gagal dimuat.");
  const environment = data?.environment ?? "sandbox";
  return { enabled: Boolean(data?.enabled && midtransKey(environment)), environment };
});

export const createPayment = createServerFn({ method: "POST" }).inputValidator(input => checkoutInput.parse(input)).handler(async ({ data }) => {
  setResponseHeader("Cache-Control", "no-store");
  const { publicPaymentClient, midtransKey, digest, midtransFetch, safeCheckoutUrl } = await import("./midtrans.server");
  const { data: config } = await publicPaymentClient().from("payment_settings").select("enabled,environment").eq("id", 1).maybeSingle();
  if (!config?.enabled || !midtransKey(config.environment)) throw new Error("Pembayaran belum diaktifkan oleh admin.");
  const buyerWhatsApp = normalizeWhatsApp(data.whatsapp).slice(14);
  const request = getRequest();
  const ip = request.headers.get("cf-connecting-ip") ?? "local";
  const accessHash = await digest(data.token);
  const requesterHash = await digest(ip + ":" + midtransKey(config.environment));
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: id, error } = await supabaseAdmin.rpc("reserve_payment_order", {
    _access_hash: accessHash, _requester_hash: requesterHash, _product_id: data.productId,
    _buyer_name: data.buyerName, _buyer_whatsapp: buyerWhatsApp, _minecraft_name: data.minecraftName,
  });
  if (error || !id) throw new Error("Pesanan belum dapat dibuat. Periksa produk atau coba beberapa menit lagi.");
  const { data: order } = await supabaseAdmin.from("payment_orders").select("*").eq("id", id).single();
  if (!order) throw new Error("Pesanan tidak ditemukan.");
  if (order.checkout_url) return { id: order.id, url: safeCheckoutUrl(order.checkout_url, order.environment) };
  if (order.status !== "creating") throw new Error("Pesanan ini tidak dapat dibayar lagi.");
  try {
    const origin = new URL(request.url).origin;
    const response = z.object({ redirect_url: z.string().url() }).parse(await midtransFetch(order.environment, "/snap/v1/transactions", {
      transaction_details: { order_id: order.id, gross_amount: order.amount },
      item_details: [{ id: order.product_id, price: order.amount, quantity: 1, name: order.product_name.slice(0, 50) }],
      customer_details: { first_name: data.buyerName, phone: buyerWhatsApp },
      enabled_payments: ["qris", "gopay", "shopeepay"],
      callbacks: { finish: `${origin}/payment/${order.id}` },
    }));
    const url = safeCheckoutUrl(response.redirect_url, order.environment);
    if (!url) throw new Error("Tautan pembayaran tidak valid.");
    const { error: saveError } = await supabaseAdmin.from("payment_orders").update({ checkout_url: url, status: "pending", updated_at: new Date().toISOString() }).eq("id", order.id).eq("status", "creating");
    if (saveError) throw new Error("Pembayaran gagal disimpan.");
    return { id: order.id, url };
  } catch {
    // Keep an uncertain provider transaction intact; do not issue duplicate charges.
    throw new Error("Pembayaran belum dapat dibuka. Periksa status pesanan sebelum mencoba lagi.");
  }
});

export const getPaymentOrder = createServerFn({ method: "POST" }).inputValidator(input => orderInput.parse(input)).handler(async ({ data }) => {
  setResponseHeader("Cache-Control", "no-store");
  const { digest, syncPaymentOrder, midtransKey, safeCheckoutUrl } = await import("./midtrans.server");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: order } = await supabaseAdmin.from("payment_orders").select("*").eq("id", data.id).eq("access_hash", await digest(data.token)).maybeSingle();
  if (!order) throw new Error("Pesanan tidak ditemukan atau akses tidak valid.");
  let verificationPending = false;
  if (midtransKey(order.environment) && Date.now() - Date.parse(order.updated_at) > 15_000 && ["creating", "pending"].includes(order.status)) {
    try { await syncPaymentOrder(order); } catch { verificationPending = true; }
  }
  const { data: latest } = await supabaseAdmin.from("payment_orders").select("*").eq("id", order.id).single();
  const row = latest ?? order;
  return { id: row.id, productName: row.product_name, amount: row.amount, status: row.status, environment: row.environment,
    fulfilled: row.fulfilled, checkoutUrl: row.checkout_url ? safeCheckoutUrl(row.checkout_url, row.environment) : null, verificationPending };
});

export const getAdminPayments = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  setResponseHeader("Cache-Control", "no-store");
  const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!admin) throw new Error("Hanya admin yang dapat mengelola pembayaran.");
  const { midtransKey } = await import("./midtrans.server");
  const { data: settings, error } = await context.supabase.from("payment_settings").select("*").eq("id", 1).maybeSingle();
  const { data: orders, error: ordersError } = await context.supabase.from("payment_orders").select("id,product_name,amount,buyer_name,buyer_whatsapp,minecraft_name,status,environment,fulfilled,created_at").order("created_at", { ascending: false }).limit(100);
  if (error || ordersError) throw new Error("Pembayaran gagal dimuat.");
  return { settings: settings ?? { id: 1, enabled: false, environment: "sandbox" }, orders: orders ?? [],
    testKeySet: Boolean(midtransKey("sandbox")), liveKeySet: Boolean(midtransKey("live")) };
});

export const savePaymentSettings = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ enabled: z.boolean(), environment: z.enum(["sandbox", "live"]) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin) throw new Error("Hanya admin yang dapat mengelola pembayaran.");
    const { midtransKey } = await import("./midtrans.server");
    if (data.enabled && !midtransKey(data.environment)) throw new Error("Simpan Server Key dengan aman di Lovable sebelum mengaktifkan pembayaran.");
    const { error } = await context.supabase.from("payment_settings").upsert({ id: 1, ...data });
    if (error) throw new Error("Pengaturan gagal disimpan.");
    return { ok: true };
  });

export const fulfillPaymentOrder = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ id: z.string().uuid() }).parse(input)).handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin) throw new Error("Hanya admin yang dapat memproses pesanan.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin.from("payment_orders").update({ fulfilled: true }).eq("id", data.id).eq("status", "paid").select("id").maybeSingle();
    if (error || !order) throw new Error("Hanya pesanan yang sudah dibayar dapat diselesaikan.");
    return { ok: true };
  });