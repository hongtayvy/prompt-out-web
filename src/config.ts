import { existsSync, readFileSync } from "node:fs";
import type { SiteConfig } from "./render.js";

/**
 * Build-time config. Environment variables win; `site.config.json` supplies defaults.
 * Everything here is PUBLIC (it ships in the page source): the Supabase project URL, the
 * publishable (anon) key, the MCP URL and a contact address. Never put a secret/service-role
 * key in either place.
 */
export function loadSiteConfig(env: Record<string, string | undefined>, filePath?: string): SiteConfig {
  const file: Partial<SiteConfig> =
    filePath && existsSync(filePath) ? (JSON.parse(readFileSync(filePath, "utf8")) as Partial<SiteConfig>) : {};
  const pick = (envKey: string, fileVal: string | undefined, fallback = "") => env[envKey] || fileVal || fallback;

  const supabaseKey = pick("SUPABASE_ANON_KEY", file.supabaseAnonKey);
  if (/service_role|sb_secret_/.test(supabaseKey) || looksLikeServiceRoleJwt(supabaseKey)) {
    throw new Error("Refusing to build: SUPABASE_ANON_KEY looks like a secret/service-role key. Use the publishable/anon key.");
  }
  return {
    supabaseUrl: pick("SUPABASE_URL", file.supabaseUrl).replace(/\/$/, ""),
    supabaseAnonKey: supabaseKey,
    mcpUrl: pick("MCP_URL", file.mcpUrl, "https://mcp.example.com/mcp"),
    contactEmail: pick("CONTACT_EMAIL", file.contactEmail, "support@example.com"),
  };
}

/** Legacy Supabase keys are JWTs whose payload carries the role. */
function looksLikeServiceRoleJwt(key: string): boolean {
  const part = key.split(".")[1];
  if (!part) return false;
  try {
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8")).role === "service_role";
  } catch {
    return false;
  }
}
