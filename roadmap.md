# Website polish
- [x] Refine store header, hero, catalog and product cards while preserving amethyst identity.
- [x] Improve mobile layouts and navigation feedback without changing catalog data.
- [x] Check public interactions, authenticated admin layouts, existing tests and page metadata.

# WhatsApp contact
- [x] Replace Discord links with WhatsApp and add admin-editable store contact.
- [x] Verify authenticated saving/readback of empty contact, public disabled buttons, and invalid input rejection; no real number supplied.

# Login recovery
- [x] Diagnose login errors and prevent failed requests from leaving the login button stuck.
- [x] Verify network-error login feedback, password visibility, and authenticated admin access; eliminate initial-render mismatch.

# Automatic payments
- [ ] Prepare Midtrans QRIS/e-wallet checkout, private order status and verified notifications.
- [ ] Add admin payment settings and orders without exposing keys.
- [ ] Test disabled checkout, admin access, payment rules and mobile layout.
- [ ] Run a real Midtrans test transaction after the user supplies a test key (blocked: account not registered).