import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND_NAME, BRAND_SLUG } from "./brand.js";
import type { SiteConfig } from "./render.js";

const TEMPLATE = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "template.html"), "utf8");

/** Safe inside both HTML text and single-quoted JS strings. */
const safe = (s: string) =>
  s.replace(/[\\'"<>&\n\r]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
const html = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** The landing page is src/template.html with build-time values filled in. */
export function renderLanding(cfg: SiteConfig): string {
  return TEMPLATE.replaceAll("__SUPABASE_URL__", safe(cfg.supabaseUrl))
    .replaceAll("__SUPABASE_ANON_KEY__", safe(cfg.supabaseAnonKey))
    .replaceAll("__CONTACT_EMAIL__", html(cfg.contactEmail))
    .replaceAll("__BRAND_SLUG__", html(BRAND_SLUG))
    .replaceAll("__BRAND__", html(BRAND_NAME));
}

const fill = (t: string, cfg: SiteConfig) =>
  t.replaceAll("__CONTACT_EMAIL__", html(cfg.contactEmail)).replaceAll("__BRAND_SLUG__", html(BRAND_SLUG)).replaceAll("__BRAND__", html(BRAND_NAME));

const pick = (re: RegExp) => TEMPLATE.match(re)?.[0] ?? "";

const PROSE_CSS = `.legal{max-width:720px;padding:72px 0 96px}.legal h1{font-size:clamp(36px,5vw,52px);letter-spacing:-2.4px;line-height:1.08;margin:0 0 18px;font-weight:780}
.legal h2{font-size:22px;letter-spacing:-.6px;margin:40px 0 10px}.legal p,.legal li{color:#3f4a42;line-height:1.8}.legal ul{padding-left:22px}
.legal .note{background:var(--subtle);border:1px solid var(--line);border-radius:10px;padding:12px 16px;font-size:13px;color:var(--muted)}
.legal a{text-underline-offset:4px}`;

/** Shared chrome for the legal pages: same stylesheet, nav and footer as the landing page. */
export function renderLegalShell(title: string, bodyHtml: string, cfg: SiteConfig): string {
  const style = pick(/<style>[\s\S]*?<\/style>/).replace("</style>", `${PROSE_CSS}</style>`);
  const nav = pick(/<nav class="site-nav"[\s\S]*?<\/nav>/)
    .replace('href="#top"', 'href="/"')
    .replace(/href="#(how|features|join)"/g, 'href="/#$1"');
  const footer = pick(/<footer class="footer">[\s\S]*?<\/footer>/).replace('href="#top"', 'href="/"').replace(/<span id="year"><\/span>/, String(new Date().getFullYear()));
  return fill(
    `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#f5f6f2"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>${html(title)} · __BRAND__</title>${style}</head>
<body><div class="container">${nav}<main class="legal">${bodyHtml}</main>${footer}</div></body></html>`,
    cfg,
  );
}
