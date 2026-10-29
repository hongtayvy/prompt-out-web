import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSiteConfig } from "./config.js";
import { renderConsent, renderIndex, renderPrivacy, renderTerms, type SiteConfig } from "./render.js";

// Env vars override site.config.json. If Supabase isn't configured the page detects the empty
// values and disables the waitlist form (and /oauth/consent).
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cfg: SiteConfig = loadSiteConfig(process.env, join(root, "site.config.json"));
if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) console.warn("warning: Supabase not configured; waitlist/OAuth consent disabled");
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
