import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/seed-admin")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: "admin@obsverse.id",
          password: "obsverse123",
          email_confirm: true,
        });
        return Response.json({ ok: !error, id: data?.user?.id ?? null, error: error?.message ?? null });
      },
    },
  },
});
