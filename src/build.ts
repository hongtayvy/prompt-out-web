import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderConsent, renderIndex, renderPrivacy, renderTerms, type SiteConfig } from "./render.js";

// Supabase isn't required to ship the landing page: the page detects empty
// values and disables the waitlist form. Set both to enable it (and /oauth/consent).
const opt = (k: string) => {
  const v = process.env[k] ?? "";
  if (!v) console.warn(`warning: ${k} is not set; waitlist/OAuth consent disabled`);
  return v;
};
const cfg: SiteConfig = {
  supabaseUrl: opt("SUPABASE_URL").replace(/\/$/, ""),
  supabaseAnonKey: opt("SUPABASE_ANON_KEY"),
  mcpUrl: process.env.MCP_URL ?? "https://mcp.example.com/mcp",
  contactEmail: process.env.CONTACT_EMAIL ?? "support@example.com",
};
const FRAME_ANCESTORS = "https://victoryang.xyz https://www.victoryang.xyz";
const out = join(dirname(fileURLToPath(import.meta.url)), "../dist");
mkdirSync(out, { recursive: true });
cpSync(join(dirname(fileURLToPath(import.meta.url)), "../public"), out, { recursive: true });
writeFileSync(join(out, "index.html"), renderIndex(cfg));
writeFileSync(join(out, "privacy.html"), renderPrivacy(cfg));
writeFileSync(join(out, "terms.html"), renderTerms(cfg));
mkdirSync(join(out, "oauth"), { recursive: true });
writeFileSync(join(out, "oauth", "consent.html"), renderConsent(cfg));
// Cloudflare Pages reads this; Render ignores it (headers live in render.yaml).
writeFileSync(
  join(out, "_headers"),
  `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
# Only the landing page may be embedded, and only by victoryang.xyz (Victor's
# portfolio previews it in a tab). Everything else, above all the OAuth consent
# page, stays unframeable so it cannot be used for clickjacking.
/
  ! X-Frame-Options
  Content-Security-Policy: frame-ancestors ${FRAME_ANCESTORS}
/index.html
  ! X-Frame-Options
  Content-Security-Policy: frame-ancestors ${FRAME_ANCESTORS}
/oauth/*
  Content-Security-Policy: frame-ancestors 'none'
`,
);
console.log(`built landing → ${out}`);
