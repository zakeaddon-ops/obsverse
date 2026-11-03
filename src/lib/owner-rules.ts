export function requireOwnerMembership(owner: boolean) {
  if (!owner) throw new Error("Hanya owner yang dapat mengubah key dan pengaturan pembayaran.");
}