import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { notificationTemplate } from "./notification-rules";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/whatsapp";

async function gateway(path: string, body?: unknown) {
  const appKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["WHATSAPP_API_KEY"];
  if (!appKey || !connectionKey) throw new Error("WhatsApp belum terhubung.");
  const response = await fetch(GATEWAY_URL + path, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${appKey}`, "X-Connection-Api-Key": connectionKey, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null, signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) {
    const error = await response.text();
    console.error(`WhatsApp request failed [${response.status}]: ${error}`);
    return { ok: false as const, status: response.status, error };
  }
  return { ok: true as const, data: await response.json() };
}

export async function whatsappReadiness() {
  try {
    const result = await gateway("/message_templates?limit=100");
    if (!result.ok) return { ready: false, message: `WhatsApp belum tersedia (${result.status}). Periksa koneksi WhatsApp di Lovable.` };
    const templates: { name: string; status: string; language: string; components?: { type: string; text?: string }[] }[] = result.data.data ?? [];
    const ready = ["paid", "expired"].every(status => templates.some(t => t.name === notificationTemplate(status) && t.status === "APPROVED" && t.language === "id" && t.components?.some(c => c.type === "BODY" && c.text?.includes("{{1}}") && c.text.includes("{{2}}"))));
    const { data: state, error } = await supabaseAdmin.from("order_service_state").select("paused,message").eq("id", "whatsapp").maybeSingle();
    if (error) throw new Error("Status WhatsApp gagal dimuat.");
    return { ready: ready && !state?.paused, message: state?.paused ? state.message ?? "WhatsApp dijeda." : ready ? "Template WhatsApp disetujui." : "Menunggu persetujuan template notifikasi dari Meta." };
  } catch { return { ready: false, message: "WhatsApp belum dapat diperiksa. Periksa koneksi di Lovable." }; }
}

export async function processWhatsAppEvent(id: string) {
  const { error } = await supabaseAdmin.rpc("process_whatsapp_event", { _id: id });
  if (error) {
    const { error: saveError } = await supabaseAdmin.from("whatsapp_webhook_events").update({ processing_error: error.message, next_attempt_at: new Date(Date.now() + 60_000).toISOString() }).eq("id", id);
    if (saveError) throw new Error("Pemrosesan WhatsApp gagal disimpan.");
    throw new Error("Pemrosesan WhatsApp belum selesai.");
  }
}

export async function recoverWhatsAppInbox(excludeId?: string) {
  const { data, error } = await supabaseAdmin.from("whatsapp_webhook_events").select("id").is("processed_at", null).lte("next_attempt_at", new Date().toISOString()).order("next_attempt_at").limit(3);
  if (error) throw new Error("Pemulihan WhatsApp gagal dimuat.");
  for (const row of data ?? []) {
    if (row.id === excludeId) continue;
    try { await processWhatsAppEvent(row.id); } catch { /* Failed rows are deferred, not allowed to starve other work. */ }
  }
}

// Called after payment status updates, on admin refresh, and on verified callbacks.
// Never resend ambiguous requests: operator review is required for uncertain outcomes.
export async function dispatchWhatsAppNotifications() {
  await recoverWhatsAppInbox();
  const now = new Date().toISOString();
  const { error: leaseError } = await supabaseAdmin.from("order_notifications").update({ state: "uncertain", error: "Proses pengiriman terputus. Periksa sebelum mengirim ulang." }).eq("state", "sending").lt("updated_at", new Date(Date.now() - 60_000).toISOString());
  if (leaseError) throw new Error("Status pengiriman gagal diperbarui.");
  const { data: rows, error } = await supabaseAdmin.from("order_notifications").select("*").in("state", ["queued", "blocked"]).lte("next_attempt_at", now).order("next_attempt_at").limit(1);
  if (error) throw new Error("Notifikasi gagal dimuat.");
  if (!rows?.length) return;
  const readiness = await whatsappReadiness();
  for (const row of rows) {
    if (!readiness.ready) {
      const { error: blockedError } = await supabaseAdmin.from("order_notifications").update({ state: "blocked", error: readiness.message, next_attempt_at: new Date(Date.now() + 300_000).toISOString() }).eq("id", row.id).eq("state", row.state);
      if (blockedError) throw new Error("Status notifikasi gagal disimpan.");
      continue;
    }
    const { data: order, error: orderError } = await supabaseAdmin.from("payment_orders").select("buyer_whatsapp,product_name").eq("id", row.order_id).single();
    if (orderError || !order) throw new Error("Pesanan notifikasi gagal dimuat.");
    const { data: claim, error: claimError } = await supabaseAdmin.from("order_notifications").update({ state: "sending", updated_at: now }).eq("id", row.id).eq("state", row.state).eq("updated_at", row.updated_at).select("id").maybeSingle();
    if (claimError) throw new Error("Notifikasi gagal diklaim.");
    if (!claim) continue;
    try {
      const result = await gateway("/messages", {
        messaging_product: "whatsapp", to: order.buyer_whatsapp, type: "template",
        template: { name: notificationTemplate(row.status), language: { code: "id" }, components: [{ type: "body", parameters: [{ type: "text", text: row.order_id }, { type: "text", text: order.product_name }] }] },
      });
      const providerId = result.ok ? result.data.messages?.[0]?.id : null;
      const { error: saveError } = await supabaseAdmin.from("order_notifications").update({
        state: result.ok ? providerId ? "accepted" : "uncertain" : "failed",
        provider_id: providerId ?? null, error: result.ok ? providerId ? null : "WhatsApp tidak mengembalikan ID pesan." : `[${result.status}] ${result.error}`,
        updated_at: new Date().toISOString(),
      }).eq("id", row.id).eq("state", "sending");
      if (saveError) throw new Error("Hasil pengiriman gagal disimpan.");
      if (providerId) {
        const { error: reconcileError } = await supabaseAdmin.rpc("reconcile_whatsapp_delivery", { _provider_id: providerId });
        if (reconcileError) throw new Error("Status pengiriman belum direkonsiliasi.");
      }
    } catch {
      const { error: uncertainError } = await supabaseAdmin.from("order_notifications").update({ state: "uncertain", error: "Hasil pengiriman belum diketahui; jangan mengirim ulang sebelum diperiksa.", updated_at: new Date().toISOString() }).eq("id", row.id).eq("state", "sending");
      if (uncertainError) throw new Error("Hasil pengiriman belum dapat disimpan.");
    }
  }
}