import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checkoutInput, orderInput, paymentCanActivate } from "./payment-rules";
import { normalizeWhatsApp } from "./whatsapp";
import { requireOwnerMembership } from "./owner-rules";

export const getPaymentAvailability = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "no-store");
  const { publicPaymentClient, paymentKey } = await import("./nexapayz.server");
  const { data, error } = await publicPaymentClient().from("payment_settings").select("enabled").eq("id", 1).maybeSingle();
  if (error) throw new Error("Pengaturan pembayaran gagal dimuat.");
  return { enabled: paymentCanActivate(data?.enabled ?? false, Boolean(await paymentKey())), environment: "live" };
});

export const createPayment = createServerFn({ method: "POST" }).inputValidator(input => checkoutInput.parse(input)).handler(async ({ data }) => {
  setResponseHeader("Cache-Control", "no-store");
  const { publicPaymentClient, paymentKey, digest, nexaFetch, safeCheckoutUrl } = await import("./nexapayz.server");
  const { data: config, error: configError } = await publicPaymentClient().from("payment_settings").select("enabled").eq("id", 1).maybeSingle();
  if (configError) throw new Error("Pengaturan pembayaran gagal dimuat.");
  const key = await paymentKey();
  if (!config?.enabled || !key) throw new Error("Pembayaran belum diaktifkan oleh owner.");
  const buyerWhatsApp = normalizeWhatsApp(data.whatsapp).slice(14);
  const request = getRequest();
  const ip = request.headers.get("cf-connecting-ip") ?? "local";
  const accessHash = await digest(data.token);
  const requesterHash = await digest(ip + ":" + key);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: id, error } = await supabaseAdmin.rpc("reserve_payment_order", {
    _access_hash: accessHash, _requester_hash: requesterHash, _product_id: data.productId,
    _buyer_name: data.buyerName, _buyer_whatsapp: buyerWhatsApp, _minecraft_name: data.minecraftName,
  });
  if (error || !id) throw new Error("Pesanan belum dapat dibuat. Periksa produk atau coba beberapa menit lagi.");
  const { data: order } = await supabaseAdmin.from("payment_orders").select("*").eq("id", id).single();
  if (!order) throw new Error("Pesanan tidak ditemukan.");
  if (order.product_id !== data.productId || order.buyer_name !== data.buyerName || order.buyer_whatsapp !== buyerWhatsApp || order.minecraft_name !== data.minecraftName) {
    throw new Error("Data berbeda dari pesanan sebelumnya. Buka pesanan dari tab checkout yang sama.");
  }
  if (order.checkout_url) return { id: order.id, url: safeCheckoutUrl(order.checkout_url) };
  if (order.status !== "creating") throw new Error("Pesanan ini tidak dapat dibayar lagi.");
  try {
    const invoice = z.object({ success: z.literal(true), invoice_id: z.string().regex(/^[A-Za-z0-9_-]{4,64}$/), amount: z.number(), payment_link: z.string() })
      .parse(await nexaFetch("/api/invoice", { amount: String(order.amount) }));
    const url = safeCheckoutUrl(invoice.payment_link);
    if (!url || invoice.amount !== order.amount) throw new Error("Tautan pembayaran tidak valid.");
    const { error: saveError } = await supabaseAdmin.from("payment_orders").update({ checkout_url: url, provider_invoice_id: invoice.invoice_id, status: "pending", updated_at: new Date().toISOString() }).eq("id", order.id).eq("status", "creating");
    if (saveError) throw new Error("Pembayaran gagal disimpan.");
    return { id: order.id, url };
  } catch {
    // Keep an uncertain provider request intact; do not issue duplicate invoices.
    return { id: order.id, url: null };
  }
});

export const getPaymentOrder = createServerFn({ method: "POST" }).inputValidator(input => orderInput.parse(input)).handler(async ({ data }) => {
  setResponseHeader("Cache-Control", "no-store");
  const { digest, syncPaymentOrder, paymentKey, safeCheckoutUrl } = await import("./nexapayz.server");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: order } = await supabaseAdmin.from("payment_orders").select("*").eq("id", data.id).eq("access_hash", await digest(data.token)).maybeSingle();
  if (!order) throw new Error("Pesanan tidak ditemukan atau akses tidak valid.");
  let verificationPending = false;
  if (await paymentKey() && Date.now() - Date.parse(order.updated_at) > 10_000 && order.status === "pending") {
    try { await syncPaymentOrder(order); } catch { verificationPending = true; }
  }
  const { data: latest } = await supabaseAdmin.from("payment_orders").select("*").eq("id", order.id).single();
  const row = latest ?? order;
  return { id: row.id, productName: row.product_name, amount: row.amount, status: row.status, environment: row.environment,
    fulfilled: row.fulfilled, createdAt: row.created_at, checkoutUrl: row.checkout_url ? safeCheckoutUrl(row.checkout_url) : null, verificationPending };
});

export const getAdminPayments = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  setResponseHeader("Cache-Control", "no-store");
  const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!admin) throw new Error("Hanya admin yang dapat mengelola pembayaran.");
  const { paymentKey } = await import("./nexapayz.server");
  const { data: owner } = await context.supabase.rpc("is_store_owner");
  const { data: settings, error } = await context.supabase.from("payment_settings").select("*").eq("id", 1).maybeSingle();
  const { data: orders, error: ordersError } = await context.supabase.from("payment_orders").select("id,product_name,amount,buyer_name,buyer_whatsapp,minecraft_name,status,environment,fulfilled,created_at").order("created_at", { ascending: false }).limit(100);
  if (error || ordersError) throw new Error("Pembayaran gagal dimuat.");
  return { settings: settings ?? { id: 1, enabled: false, environment: "live" }, orders: orders ?? [],
    isOwner: owner === true, keySet: Boolean(await paymentKey()) };
});

export const savePaymentSettings = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ enabled: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: owner, error: roleError } = await context.supabase.rpc("is_store_owner");
    requireOwnerMembership(!roleError && owner === true);
    const { paymentKey } = await import("./nexapayz.server");
    if (data.enabled && !await paymentKey()) throw new Error("Simpan API Key NexaPayz sebelum mengaktifkan pembayaran.");
    const { error } = await context.supabase.from("payment_settings").upsert({ id: 1, environment: "live", enabled: data.enabled });
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
