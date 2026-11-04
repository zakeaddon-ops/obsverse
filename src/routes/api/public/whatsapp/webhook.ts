import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhookRequest, WebhookError } from "@lovable.dev/webhooks-js";

export const Route = createFileRoute("/api/public/whatsapp/webhook")({ server: { handlers: {
  POST: async ({ request }) => {
    const secret = process.env["WHATSAPP_API_KEY"];
    if (!secret) return new Response("Not configured", { status: 503 });
    let payload: unknown;
    try { ({ payload } = await verifyWebhookRequest({ req: request, secret, maxBodyBytes: 4 * 1024 * 1024 })); }
    catch (error) { return new Response("Invalid delivery", { status: error instanceof WebhookError && error.code === "body_too_large" ? 413 : 401 }); }
    const delivery = request.headers.get("X-Lovable-Delivery")?.trim();
    const event = request.headers.get("X-Lovable-Event")?.trim();
    if (!delivery || !event || delivery.length > 256 || event.length > 256) return new Response("Missing delivery headers", { status: 400 });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: insertError } = await supabaseAdmin.from("whatsapp_webhook_events").upsert({ delivery_id: delivery, event, payload: payload as never }, { onConflict: "delivery_id", ignoreDuplicates: true });
    if (insertError) return new Response("Receipt unavailable", { status: 503 });
    const { data: row, error } = await supabaseAdmin.from("whatsapp_webhook_events").select("id,processed_at").eq("delivery_id", delivery).single();
    if (error || !row) return new Response("Receipt unavailable", { status: 503 });
    const { processWhatsAppEvent, recoverWhatsAppInbox } = await import("@/lib/whatsapp-notifications.server");
    try {
      if (!row.processed_at) await processWhatsAppEvent(row.id);
      await recoverWhatsAppInbox(row.id);
    } catch { return new Response("Processing pending", { status: 503 }); }
    return new Response("OK", { headers: { "Cache-Control": "no-store" } });
  },
} } });