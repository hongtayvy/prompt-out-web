import { BRAND_NAME } from "./brand.js";
import { COPY } from "./copy.js";
import { renderLanding, renderLegalShell } from "./site.js";

export interface SiteConfig {
  supabaseUrl: string;
  /** Public anon key only. The service-role key must never reach this site. */
  supabaseAnonKey: string;
  mcpUrl: string;
  contactEmail: string;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const STYLE = `
:root{--bg:#fff;--fg:#14141a;--muted:#5b5b6b;--accent:#5b3df5;--card:#f5f4fb;--border:#e3e1f0}
@media(prefers-color-scheme:dark){:root{--bg:#0e0e13;--fg:#f2f2f7;--muted:#a3a3b5;--accent:#8b78ff;--card:#17171f;--border:#2a2a38}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:720px;margin:0 auto;padding:48px 16px}
h1{font-size:clamp(2rem,6vw,3rem);line-height:1.15;margin:0 0 16px}h2{margin-top:48px}
.lead{font-size:1.15rem;color:var(--muted)}
form{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0 8px}
input[type=email]{flex:1 1 220px;padding:12px 14px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--fg);font:inherit}
button{padding:12px 20px;border-radius:10px;border:0;background:var(--accent);color:#fff;font:inherit;font-weight:600;cursor:pointer}
button:disabled{opacity:.6}.hp{position:absolute;left:-9999px}
.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px 18px;margin:12px 0}
pre{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;overflow:auto;font-size:.9rem}
footer{margin-top:64px;color:var(--muted);font-size:.9rem}footer a{color:inherit}
#msg{min-height:1.5em;color:var(--muted)}
`;

const page = (title: string, body: string, desc = COPY.pitch) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><style>${STYLE}</style></head>
<body><main>${body}
<footer><a href="/">${esc(BRAND_NAME)}</a> · <a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a></footer></main></body></html>`;

export function renderIndex(cfg: SiteConfig): string {
  return renderLanding(cfg);
}

const LEGAL_NOTE = `<p class="note">Template text. Have this reviewed by counsel before store submission.</p>`;

export function renderPrivacy(cfg: SiteConfig): string {
  return renderLegalShell(
    "Privacy Policy",
    `<h1>Privacy Policy</h1>${LEGAL_NOTE}
<h2>What we collect</h2><ul>
<li><strong>Account:</strong> your email address and a hashed password (or Google sign-in identifier).</li>
<li><strong>Your library:</strong> the prompts you save, their tags, source links and the original captured text.</li>
<li><strong>Waitlist:</strong> your email address, if you join it.</li></ul>
<h2>How we use it</h2><p>To run ${esc(BRAND_NAME)}: store your library, extract and standardize prompts with AI models, and search your library, including when you connect an AI assistant over MCP. We do not sell your data and your library is private to you.</p>
<h2>Service providers</h2><p>Captured text is sent to AI model providers for extraction and embedding. Data is stored with our database and hosting providers.</p>
<h2>Your choices</h2><p>You can delete prompts at any time and request account deletion by emailing <a href="mailto:${esc(cfg.contactEmail)}">${esc(cfg.contactEmail)}</a>.</p>`,
    cfg,
  );
}

export function renderTerms(cfg: SiteConfig): string {
  return renderLegalShell(
    "Terms of Service",
    `<h1>Terms of Service</h1>${LEGAL_NOTE}
<p>By using ${esc(BRAND_NAME)} you agree to these terms.</p>
<h2>Your content</h2><p>You keep ownership of the prompts you save. You grant us the limited right to store and process them to provide the service. Only save content you have the right to save.</p>
<h2>Acceptable use</h2><p>Don't misuse the service, attempt to access other users' data, or overload our systems.</p>
<h2>No warranty</h2><p>The service is provided as is. AI extraction can be imperfect; review prompts before relying on them.</p>
<h2>Contact</h2><p><a href="mailto:${esc(cfg.contactEmail)}">${esc(cfg.contactEmail)}</a></p>`,
    cfg,
  );
}

/** OAuth consent screen for MCP clients (Supabase OAuth server redirects here with ?authorization_id=). */
export function renderConsent(cfg: SiteConfig): string {
  const css = `<style>
.consent{max-width:460px;margin:0 auto}.consent .card{background:var(--paper);border:1px solid var(--ink);border-radius:14px;padding:28px;box-shadow:4px 4px 0 var(--ink)}
.consent h1{font-size:28px;letter-spacing:-1.2px;margin:0 0 10px}.consent h2{font-size:22px;letter-spacing:-.8px;margin:0 0 10px}
.consent p{color:var(--muted);margin:0 0 14px}.consent ul{margin:0 0 16px;padding-left:0;list-style:none}
.consent li{display:flex;gap:10px;align-items:center;padding:6px 0;font-size:14px;color:var(--ink)}
.consent li:before{content:"✓";display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:#e4efcf;color:var(--green);font-size:12px;font-weight:700;flex-shrink:0}
.consent input{display:block;width:100%;margin-top:8px;padding:13px;border:1px solid var(--ink);border-radius:7px;background:#fff;color:var(--ink);font-size:14px}
.consent .row{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.consent .btn{box-shadow:none}.consent #err{color:#b3261e;font-size:13px;margin-top:10px}
.consent .who{font-size:12px;color:var(--muted)}
</style>`;
  const script = `
import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/+esm';
const sb=createClient(${JSON.stringify(cfg.supabaseUrl)},${JSON.stringify(cfg.supabaseAnonKey)});
const root=document.getElementById('root');
const id=new URLSearchParams(location.search).get('authorization_id');
const el=(h)=>{root.innerHTML=h};
const txt=(s)=>{const d=document.createElement('div');d.textContent=String(s??'');return d.innerHTML};
async function main(){
  if(!id){el('<h2>Missing request</h2><p>This page needs an authorization request from your AI assistant.</p>');return;}
  const {data:{user}}=await sb.auth.getUser();
  if(!user){
    el('<h2>Sign in to continue</h2><p>Sign in to approve this connection.</p><form id="si"><input type="email" name="email" placeholder="you@example.com" required autocomplete="username"><input type="password" name="password" placeholder="Password" required autocomplete="current-password"><div class="row"><button class="btn" type="submit">Sign in</button></div></form><p id="err" role="alert"></p>');
    document.getElementById('si').addEventListener('submit',async e=>{
      e.preventDefault();const f=new FormData(e.target);
      const {error}=await sb.auth.signInWithPassword({email:f.get('email'),password:f.get('password')});
      if(error)document.getElementById('err').textContent=error.message;else main();
    });return;
  }
  const {data,error}=await sb.auth.oauth.getAuthorizationDetails(id);
  if(error){el('<h2>Something went wrong</h2><p>'+txt(error.message)+'</p>');return;}
  if(!('authorization_id' in data)){location.href=data.redirect_url;return;}
  const scopes=String(data.scope||'').split(' ').filter(Boolean).map(s=>'<li>'+txt(s)+'</li>').join('');
  el('<h2>Allow '+txt(data.client.name)+' to access your library?</h2><p>It will be able to search and read your saved prompts on your behalf. You can revoke access any time.</p><ul>'+scopes+'</ul><p class="who">Signed in as '+txt(user.email)+'</p><div class="row"><button class="btn" id="ok">Allow access</button><button class="btn btn-dark" id="no">Deny</button></div><p id="err" role="alert"></p>');
  const done=async(fn)=>{const r=await fn(id);if(r.error){document.getElementById('err').textContent=r.error.message;return;}location.href=r.data.redirect_url;};
  document.getElementById('ok').onclick=()=>done(i=>sb.auth.oauth.approveAuthorization(i));
  document.getElementById('no').onclick=()=>done(i=>sb.auth.oauth.denyAuthorization(i));
}
main();`;
  return renderLegalShell(
    "Authorize access",
    `${css}<div class="consent"><h1>Connect your library</h1><div class="card" id="root">Loading…</div></div><script type="module">${script}</script>`,
    cfg,
  );
}
