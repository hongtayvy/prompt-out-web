# prompt-out-web

Static landing page, waitlist, privacy/terms and OAuth consent pages.

- Edit the design in `src/template.html`; legal and consent pages reuse its styles, nav and footer (`src/site.ts`).
- Brand name and copy: `src/brand.ts`, `src/copy.ts`.
- Build: `SUPABASE_URL=… SUPABASE_ANON_KEY=… MCP_URL=… CONTACT_EMAIL=… npm run build` → `dist/`
- Test: `npm test`. Deploy: Render static site (`render.yaml`). Set the Supabase **anon** key only, never the service-role key.
- Needs the `waitlist` table from `supabase/migrations/20260102000000_waitlist.sql` in the app repo.

## Deploy on Render
1. Push this repo to GitHub, then Render → New → Blueprint → select the repo (it reads `render.yaml`).
2. Set the four env vars when prompted: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (anon only), `MCP_URL` (e.g. `https://mcp.yourdomain.com/mcp`), `CONTACT_EMAIL`.
3. After the first deploy, in Supabase → Authentication:
   - URL Configuration → Site URL = your Render URL (or custom domain).
   - OAuth Server → Authorization path = `/oauth/consent`.
4. Optional: add a custom domain in Render (HTTPS is automatic).

Changing env vars requires a redeploy, because values are baked in at build time.
