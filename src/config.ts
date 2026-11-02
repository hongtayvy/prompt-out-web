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
    appUrl: webUrl(pick("APP_URL", file.appUrl, "https://app.example.com")),
    contactEmail: pick("CONTACT_EMAIL", file.contactEmail, "support@example.com"),
    operatorName: pick("OPERATOR_NAME", file.operatorName),
    operatorAddress: pick("OPERATOR_ADDRESS", file.operatorAddress),
    governingLaw: pick("GOVERNING_LAW", file.governingLaw),
  };
}

/** The legal pages name who runs the service and which law applies. The build refuses to ship them blank. */
export function missingOperatorFields(cfg: SiteConfig): string[] {
  const need: (keyof SiteConfig)[] = ["operatorName", "operatorAddress", "governingLaw"];
  return need.filter((k) => !cfg[k].trim());
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

/** The web app's address. Only http(s) links are allowed, since it becomes an href on the page. */
function webUrl(url: string): string {
  if (!/^https?:\/\/[^\s"'<>]+$/i.test(url)) throw new Error(`APP_URL must be an http(s) URL, got: ${url}`);
  return url.replace(/\/$/, "");
}
