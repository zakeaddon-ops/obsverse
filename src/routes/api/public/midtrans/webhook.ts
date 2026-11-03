import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/api/public/midtrans/webhook")({ server: { handlers: {
  POST: async ({ request }) => {
    if (Number(request.headers.get("content-length") ?? 0) > 16_384) return new Response("Too large", { status: 413 });
    const raw = await request.text();
    if (raw.length > 16_384) return new Response("Too large", { status: 413 });
    let notification;
    try {
      notification = z.object({ order_id: z.string().uuid(), status_code: z.string().regex(/^\d{3}$/), gross_amount: z.string().regex(/^\d+(\.\d{1,2})?$/), signature_key: z.string().regex(/^[a-f0-9]{128}$/) }).parse(JSON.parse(raw));
    } catch { return new Response("Invalid notification", { status: 400 }); }
    const { digest, midtransKey, equalDigest, syncPaymentOrder } = await import("@/lib/midtrans.server");
    // Authenticate with either configured environment key before privileged reads.
    let environment: string | undefined;
    for (const mode of ["sandbox", "live"]) {
      const key = await midtransKey(mode);
      if (key && equalDigest(await digest(notification.order_id + notification.status_code + notification.gross_amount + key, "SHA-512"), notification.signature_key)) environment = mode;
    }
    if (!environment) return new Response("Unauthorized", { status: 401 });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin.from("payment_orders").select("*").eq("id", notification.order_id).eq("environment", environment).maybeSingle();
    if (error) return new Response("Try again", { status: 503 });
    if (!order) return new Response("Not found", { status: 404 });
    try { await syncPaymentOrder(order); } catch { return new Response("Verification unavailable", { status: 503 }); }
    return new Response("OK", { headers: { "Cache-Control": "no-store" } });
  },
} } });