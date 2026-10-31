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

const LEGAL_UPDATED = "October 31, 2026";
const updated = `<p class="note">Last updated ${LEGAL_UPDATED}.</p>`;

export function renderPrivacy(cfg: SiteConfig): string {
  const mail = `<a href="mailto:${esc(cfg.contactEmail)}">${esc(cfg.contactEmail)}</a>`;
  return renderLegalShell(
    "Privacy Policy",
    `<h1>Privacy Policy</h1>${updated}
<p>${esc(BRAND_NAME)} is a private library for the AI prompts you save. This page explains what we collect, why, and the choices you have. Your library is private to you.</p>
<h2>What we collect</h2><ul>
<li><strong>Account:</strong> your email address and a password, which is stored only as a salted hash by our authentication provider. We never see or store your password in readable form.</li>
<li><strong>Your library:</strong> the prompts you save, with their titles, summaries, tags and source links. If you use extraction, we also keep the original text you pasted.</li>
<li><strong>Waitlist:</strong> your email address, if you join it. You can ask us to remove it at any time.</li>
<li><strong>Technical data:</strong> standard server logs (such as IP address, request time and error details) kept briefly to run, secure and debug the service. We log events, not the contents of your prompts.</li></ul>
<h2>How we use it</h2><p>Only to run ${esc(BRAND_NAME)}: to sign you in, store your library, search it, and let AI assistants you connect read it. We do not sell your data, we do not use it for advertising, and we do not use your prompts to train AI models.</p>
<h2>AI features and connected assistants</h2><ul>
<li><strong>Extraction and semantic search</strong> are optional AI features. When they are turned on, the text you submit is sent to our AI model providers to extract a prompt or compute a search embedding. When they are off, prompts are saved as plain text and searched by keyword, and nothing is sent to an AI model provider.</li>
<li><strong>Connecting an assistant (MCP):</strong> when you connect Claude, ChatGPT, Cursor or another assistant, you sign in and approve access on a consent screen. That assistant can then search, read, save and edit prompts in your library on your behalf (it cannot delete them), and what it does with your prompts is governed by that service's own terms and privacy policy. You can revoke access at any time.</li></ul>
<h2>Who processes your data</h2><p>We use these providers to operate the service: Supabase (database and authentication), Render (application hosting), and Cloudflare (website hosting and delivery). AI model providers are used only for the optional features above. They process data on our behalf and only to provide their service.</p>
<h2>Storage on your device</h2><p>The web app keeps your sign-in session in your browser's local storage, and the mobile app keeps it in the device's secure storage. We use no advertising or cross-site tracking cookies.</p>
<h2>Your choices</h2><ul>
<li><strong>Export:</strong> in the app, go to Settings → Your data → Export library to download everything as a JSON file.</li>
<li><strong>Edit or delete prompts:</strong> at any time, in the app.</li>
<li><strong>Delete your account:</strong> in the app, go to Settings → Delete account. This permanently deletes your account and every prompt in your library. Copies in provider backups are removed on their normal backup cycle.</li>
<li><strong>Anything else</strong> (access, correction, or removal from the waitlist): email ${mail}.</li></ul>
<h2>Security</h2><p>Data is encrypted in transit, access to each library is limited to its owner, and we limit who can reach production systems. No service can promise perfect security, so please use a strong, unique password.</p>
<h2>Children</h2><p>${esc(BRAND_NAME)} is not intended for children under 13, and we do not knowingly collect their data. If you believe a child has given us information, email ${mail} and we will delete it.</p>
<h2>Changes</h2><p>If we change this policy in a way that matters, we will update the date above and, where appropriate, tell you in the app or by email.</p>
<h2>Contact</h2><p>${mail}</p>`,
    cfg,
  );
}

export function renderTerms(cfg: SiteConfig): string {
  const mail = `<a href="mailto:${esc(cfg.contactEmail)}">${esc(cfg.contactEmail)}</a>`;
  return renderLegalShell(
    "Terms of Service",
    `<h1>Terms of Service</h1>${updated}
<p>By creating an account or using ${esc(BRAND_NAME)} you agree to these terms. If you do not agree, please do not use the service.</p>
<h2>Your account</h2><p>You are responsible for your account and for keeping your password secure. Give us accurate information, and tell us at ${mail} if you think your account has been accessed without your permission. You must be at least 13 years old to use the service.</p>
<h2>Your content</h2><p>You keep ownership of the prompts you save. You give us the limited right to store, process and display them to you, and to make them available to assistants you connect, solely to provide the service. Only save content you have the right to save, and do not store anything unlawful or anything that infringes someone else's rights.</p>
<h2>Connected assistants</h2><p>When you connect an AI assistant, you authorize it to read your library and to add and edit prompts in it on your behalf. You are responsible for deciding which assistants to connect. You can revoke access at any time, and we are not responsible for how a third-party assistant uses what it reads or for changes it makes at your direction. Review what an assistant proposes to save or change before approving it.</p>
<h2>Acceptable use</h2><p>Do not misuse the service. That includes trying to access other users' data or our systems without permission, probing or testing for vulnerabilities without our written consent, interfering with or overloading the service, using it to send spam or malware, or reselling access to it.</p>
<h2>AI output</h2><p>Extraction and search can be imperfect. Review prompts before you rely on them, and use any prompt and any assistant's output at your own judgment.</p>
<h2>Availability and changes</h2><p>We work to keep ${esc(BRAND_NAME)} running, but it may be unavailable at times, and we may change, add or remove features. If we make a material change to these terms, we will update the date above and, where appropriate, tell you in the app or by email. Continuing to use the service after a change means you accept it.</p>
<h2>Ending your account</h2><p>You can delete your account at any time in Settings, which permanently deletes your library. We may suspend or end accounts that break these terms or put the service or other users at risk.</p>
<h2>No warranty</h2><p>The service is provided "as is" and "as available", without warranties of any kind, to the extent the law allows.</p>
<h2>Limitation of liability</h2><p>To the extent the law allows, we are not liable for indirect, incidental or consequential damages, or for lost data, profits or revenue, arising from your use of the service. Please export anything you cannot afford to lose. Nothing in these terms limits liability that cannot be limited by law.</p>
<h2>Contact</h2><p>${mail}</p>`,
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
  el('<h2>Allow '+txt(data.client.name)+' to access your library?</h2><p>It will be able to search and read your saved prompts, and to save new ones and edit existing ones, on your behalf. It cannot delete prompts. You can revoke access any time.</p><ul>'+scopes+'</ul><p class="who">Signed in as '+txt(user.email)+'</p><div class="row"><button class="btn" id="ok">Allow access</button><button class="btn btn-dark" id="no">Deny</button></div><p id="err" role="alert"></p>');
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
