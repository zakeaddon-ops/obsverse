import { createServerFn } from "@tanstack/react-start";

export const seedAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "admin@obsverse.id",
    password: "obsverse123",
    email_confirm: true,
  });
  return { ok: !error, id: data?.user?.id ?? null, error: error?.message ?? null };
});
