import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOwnerMembership } from "./owner-rules";

export const saveOwnerPaymentKey = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(input => {
    // Never include credential input in validation errors returned to the browser.
    const result = z.object({ key: z.string().trim().min(8).max(256).regex(/^[A-Za-z0-9_.-]+$/) }).safeParse(input);
    if (!result.success) throw new Error("Periksa API Key NexaPayz.");
    return { ...result.data, environment: "live" as const };
  }).handler(async ({ data, context }) => {
    setResponseHeader("Cache-Control", "no-store");
    const { data: owner, error } = await context.supabase.rpc("is_store_owner");
    requireOwnerMembership(!error && owner === true);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Rotating a key on an unsettled transaction would invalidate its callbacks.
    const { count, error: orderError } = await supabaseAdmin.from("payment_orders").select("id", { count: "exact", head: true }).eq("environment", data.environment).in("status", ["creating", "pending"]);
    if (orderError || count) throw new Error("Selesaikan pesanan yang masih menunggu sebelum mengganti key.");
    const { encryptPaymentKey } = await import("./payment-credentials.server");
    const encrypted_key = await encryptPaymentKey(data.key, data.environment);
    const { error: saveError } = await supabaseAdmin.from("payment_credentials").upsert({ environment: data.environment, encrypted_key, updated_at: new Date().toISOString() });
    if (saveError) throw new Error("Key belum tersimpan. Coba lagi.");
    return { ok: true };
  });