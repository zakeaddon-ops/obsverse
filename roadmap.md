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
- [ ] Complete owner-only encrypted Midtrans key entry, provision the requested owner account, and verify access boundaries.
- [x] Cancel AI guidance at the user's request; do not implement AI assistance.
- [ ] Complete WhatsApp sending, signed durable receiver, buyer consent and recovery; activation requires renewed WhatsApp access and a deployed verified receiver.
- [x] Prepare Midtrans QRIS/e-wallet checkout, private order status and signature-checked payment notifications.
- [x] Add admin payment settings and orders without exposing keys; show key names and notification address.
- [x] Test disabled activation, authenticated settings saving/readback, payment rules, unsigned callback rejection and mobile layout.
- [ ] Run a real Midtrans test transaction after the user supplies a test key (blocked: account not registered).