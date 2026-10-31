/** Accept a WhatsApp link or an Indonesian/international phone number. */
export function normalizeWhatsApp(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const raw = trimmed.startsWith("https://wa.me/") ? trimmed.slice(14) : trimmed;
  if (!/^[+\d\s()-]+$/.test(raw)) throw new Error("Masukkan nomor WhatsApp atau tautan https://wa.me/ yang valid");
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  if (!/^[1-9]\d{6,14}$/.test(digits)) throw new Error("Nomor WhatsApp harus berisi 7–15 digit dengan kode negara");
  return `https://wa.me/${digits}`;
}

export function safeWhatsApp(value: string | null | undefined): string {
  try { return normalizeWhatsApp(value ?? ""); } catch { return ""; }
}