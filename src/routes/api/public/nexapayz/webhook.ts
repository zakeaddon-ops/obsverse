import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// NexaPayz webhooks are unsigned, so the body is only a hint: status is always re-read from the NexaPayz API.
export const Route = createFileRoute("/api/public/nexapayz/webhook")({ server: { handlers: {
  POST: async ({ request }) => {
    const raw = await request.text();
    if (raw.length > 16_384) return new Response("Too large", { status: 413 });
    let invoiceId: string;
    try { invoiceId = z.object({ invoice_id: z.string().regex(/^[A-Za-z0-9_-]{4,64}$/) }).parse(JSON.parse(raw)).invoice_id; }
    catch { return new Response("Invalid notification", { status: 400 }); }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin.from("payment_orders").select("*").eq("provider_invoice_id", invoiceId).maybeSingle();
    if (error) return new Response("Try again", { status: 503 });
    if (!order) return new Response("Not found", { status: 404 });
    const { syncPaymentOrder } = await import("@/lib/nexapayz.server");
    try { await syncPaymentOrder(order); } catch { return new Response("Verification unavailable", { status: 503 }); }
    return new Response("OK", { headers: { "Cache-Control": "no-store" } });
  },
} } });
