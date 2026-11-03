import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function encryptionKey() {
  const secret = process.env["PAYMENT_KEY_ENCRYPTION_SECRET"];
  if (!secret) throw new Error("Penyimpanan key belum tersedia.");
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", hash, "AES-GCM", false, ["encrypt", "decrypt"]);
}
export async function encryptPaymentKey(value: string, environment: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: new TextEncoder().encode(environment) }, await encryptionKey(), new TextEncoder().encode(value));
  return `${btoa(String.fromCharCode(...iv))}.${btoa(String.fromCharCode(...new Uint8Array(encrypted)))}`;
}
export async function storedPaymentKey(environment: string): Promise<string | undefined> {
  const { data, error } = await supabaseAdmin.from("payment_credentials").select("encrypted_key").eq("environment", environment).maybeSingle();
  if (error) throw new Error("Key pembayaran belum dapat dimuat.");
  if (!data) return undefined;
  try {
    const [iv, ciphertext] = data.encrypted_key.split(".");
    if (!iv || !ciphertext) throw new Error();
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: Uint8Array.from(atob(iv), c => c.charCodeAt(0)), additionalData: new TextEncoder().encode(environment) }, await encryptionKey(), Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0)));
    return new TextDecoder().decode(plain);
  } catch { throw new Error("Key pembayaran belum dapat digunakan. Hubungi owner."); }
}