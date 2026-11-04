export const NOTIFICATION_LABELS: Record<string, string> = {
  queued: "Menunggu dikirim", sending: "Sedang dikirim", accepted: "Diterima WhatsApp",
  sent: "Terkirim", delivered: "Diterima pembeli", read: "Dibaca", failed: "Gagal",
  uncertain: "Perlu diperiksa — hasil pengiriman belum diketahui", blocked: "Menunggu kesiapan WhatsApp",
};

export function notificationEligible(environment: string, status: string, consent: boolean) {
  return environment === "live" && consent && (status === "paid" || status === "expired");
}

export function notificationTemplate(status: string) {
  if (status === "paid") return "obsverse_payment_paid";
  if (status === "expired") return "obsverse_payment_expired";
  throw new Error("Status tidak memerlukan notifikasi.");
}