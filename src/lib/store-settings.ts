import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const storeSettingsQuery = queryOptions({
  queryKey: ["store-settings"],
  staleTime: 30_000,
  retry: 1,
  queryFn: async () => {
    const { data, error } = await supabase.from("store_settings").select("whatsapp_url").eq("id", 1).maybeSingle();
    if (error) throw error;
    return data;
  },
});