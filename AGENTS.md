<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Product writes and image uploads are gated by `public.has_role(auth.uid(),'admin')` (roles in `user_roles`); public can only read. Why: open signup must never grant write access.
- `product-images` bucket is private (workspace blocks public buckets); uploads store 10-year signed URLs in the products row. Why: images still load for anonymous visitors.
- Admin pages live under `src/routes/admin*.tsx` with a client-only (`ssr:false`) `beforeLoad` guard; login is `admin_.login.tsx` so it sits outside that guard.
- Back navigation on both store and admin pages goes through the shared `BackButton` component, which reads the router's position in the history stack to pick between returning to the previous page and linking to a fallback route. Why: visitors who open a page directly have no previous page, and `history.back()` would drop them out of the site.


- Store navigation feedback lives in the root layout, and the shared navbar debounces search updates. Why: avoid per-keystroke navigation churn while keeping page transitions visible.
- Store contact uses a shared settings query and WhatsApp normalization helper, with product-specific contact taking precedence. Why: admin changes must reach every contact surface without unsafe or fabricated destinations.
- Private WhatsApp chat is a shared public-store dialog using the store contact query; it only prepares an encoded wa.me message, never sends or stores it. Why: visitors converse directly with the admin in WhatsApp without exposing workspace messaging credentials.
