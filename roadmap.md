# Website polish
- [ ] Match Zakemod Hub's compact storefront layout in amethyst; verify search, filters and mobile layout without changing orders or payments.
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
- [ ] Verify owner-only encrypted Midtrans key entry and access boundaries. Requested owner account has been created and granted protected owner/admin membership; authenticated UI checks remain unfinished.
- [x] Cancel AI guidance at the user's request; do not implement AI assistance.
- [ ] Finish wiring WhatsApp sender/receiver into payment flow, add buyer consent, verify recovery and delivery. Sender and signed receiver code added but not integrated or tested; reconnect was declined and deployment/callback verification remain unavailable.
- [x] Prepare Midtrans QRIS/e-wallet checkout, private order status and signature-checked payment notifications.
- [x] Add admin payment settings and orders without exposing keys; show key names and notification address.
- [x] Test disabled activation, authenticated settings saving/readback, payment rules, unsigned callback rejection and mobile layout.
- [ ] Run a real Midtrans test transaction after the user supplies a test key (blocked: account not registered).