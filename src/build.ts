import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderConsent, renderIndex, renderPrivacy, renderTerms, type SiteConfig } from "./render.js";

const need = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env var ${k}`);
  return v;
};
const cfg: SiteConfig = {
  supabaseUrl: need("SUPABASE_URL").replace(/\/$/, ""),
  supabaseAnonKey: need("SUPABASE_ANON_KEY"),
  mcpUrl: process.env.MCP_URL ?? "https://mcp.example.com/mcp",
  contactEmail: process.env.CONTACT_EMAIL ?? "support@example.com",
};
const out = join(dirname(fileURLToPath(import.meta.url)), "../dist");
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "index.html"), renderIndex(cfg));
writeFileSync(join(out, "privacy.html"), renderPrivacy(cfg));
writeFileSync(join(out, "terms.html"), renderTerms(cfg));
mkdirSync(join(out, "oauth"), { recursive: true });
writeFileSync(join(out, "oauth", "consent.html"), renderConsent(cfg));
console.log(`built landing → ${out}`);
