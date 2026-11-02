import { BRAND_NAME } from "./brand.js";
import { COPY } from "./copy.js";
import { renderLanding, renderLegalShell } from "./site.js";

export interface SiteConfig {
  supabaseUrl: string;
  /** Public anon key only. The service-role key must never reach this site. */
  supabaseAnonKey: string;
  mcpUrl: string;
  /** Where the web app lives (sign in / sign up). */
  appUrl: string;
  contactEmail: string;
  /** Legal name of whoever operates the service (a person or a company). Shown in the legal pages. */
  operatorName: string;
  /** A mailing address for that operator; a registered-agent or PO box address is fine. */
  operatorAddress: string;
  /** Jurisdiction whose law governs the Terms, e.g. "the State of California, USA". */
  governingLaw: string;
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

const LEGAL_UPDATED = "November 1, 2026";
const updated = `<p class="note">Last updated ${LEGAL_UPDATED}.</p>`;

export function renderPrivacy(cfg: SiteConfig): string {
  const mail = `<a href="mailto:${esc(cfg.contactEmail)}">${esc(cfg.contactEmail)}</a>`;
  return renderLegalShell(
    "Privacy Policy",
    `<h1>Privacy Policy</h1>${updated}
<p>${esc(BRAND_NAME)} is a private library for the AI prompts you save. This page explains what we collect, why, and the choices you have. Your library is private to you.</p>
<h2>Who we are</h2><p>${esc(BRAND_NAME)} is operated by ${esc(cfg.operatorName)}, ${esc(cfg.operatorAddress)}. We are the controller of the personal data described here. You can reach us at ${mail}.</p>
<h2>What we collect</h2><ul>
<li><strong>Account:</strong> your email address and a password, which is stored only as a salted hash by our authentication provider. We never see or store your password in readable form.</li>
<li><strong>Your library:</strong> the prompts you save, with their titles, summaries, tags and source links. If you use extraction, we also keep the original text you pasted.</li>
<li><strong>Billing (Pro subscribers):</strong> payments are handled by Stripe. Stripe collects your card and billing details on its own pages, and we never see or store your full card number. We keep only the Stripe customer reference, your plan, your subscription status and when the current billing period ends, so we can give you Pro and let you manage it. Stripe may also keep your name, billing address and payment history under its own privacy policy.</li>
<li><strong>Waitlist:</strong> your email address, if you join it. You can ask us to remove it at any time.</li>
<li><strong>Technical data:</strong> standard server logs (such as IP address, request time and error details) kept briefly to run, secure and debug the service. We log events, not the contents of your prompts.</li></ul>
<h2>How we use it</h2><p>Only to run ${esc(BRAND_NAME)}: to sign you in, store your library, search it, let AI assistants you connect read it, and take and manage payments for Pro. We do not sell your data, we do not use it for advertising, and we do not use your prompts to train AI models.</p>
<h2>AI features and connected assistants</h2><ul>
<li><strong>Extraction and semantic search</strong> are optional AI features. When they are turned on, the text you submit is sent to our AI model providers to extract a prompt or compute a search embedding. When they are off, prompts are saved as plain text and searched by keyword, and nothing is sent to an AI model provider.</li>
<li><strong>Connecting an assistant (MCP):</strong> when you connect Claude, ChatGPT, Cursor or another assistant, you sign in and approve access on a consent screen. That assistant can then search, read, save and edit prompts in your library on your behalf (it cannot delete them), and what it does with your prompts is governed by that service's own terms and privacy policy. You can revoke access at any time.</li></ul>
<h2>Who processes your data</h2><p>We use these providers to operate the service: Supabase (database and authentication), Render (application hosting), Cloudflare (website hosting and delivery), and Stripe (payments, only if you subscribe). AI model providers are used only for the optional features above. They process data on our behalf and only to provide their service.</p>
<h2>Why we use your data</h2><p>Where the law asks us to name a legal basis: we use your account details, library and billing data to provide the service you signed up for (performance of a contract); we keep security logs and prevent abuse because it is in our legitimate interest to keep the service safe; we keep billing records because the law requires it; and we send text to optional AI features only when those features are on and you use them.</p>
<h2>How long we keep it</h2><ul>
<li>Your account and library: until you delete them. A deleted prompt stays in Recently deleted for 30 days and is then erased. Deleting your account erases everything we hold about your library right away; copies in provider backups are overwritten on their normal backup cycle.</li>
<li>Server logs: only briefly, and they do not contain the contents of your prompts.</li>
<li>Billing records: as long as tax and accounting law requires.</li>
<li>Waitlist emails: until you ask us to remove them or you create an account.</li></ul>
<h2>Where your data is processed</h2><p>Our providers may process data in the United States and in other countries. Where the law requires it, we rely on safeguards such as standard contractual clauses for transfers out of the European Economic Area, the United Kingdom or Switzerland.</p>
<h2>Your rights if you are in the EEA, the UK or Switzerland</h2><p>You can ask us to give you a copy of your data, correct it, delete it, restrict or object to how we use it, or move it to another service (the in-app export is a ready-made copy). Where we rely on your consent, you can withdraw it at any time. Most of this you can do yourself in Settings; for anything else, email ${mail} and we will answer within one month. You also have the right to complain to your local data protection authority.</p>
<h2>California privacy rights</h2><p>If you live in California, the California Consumer Privacy Act gives you the right to know what personal information we collect and how we use it, to ask us to delete or correct it, and not to be treated worse for using these rights. In the last 12 months we collected identifiers (your email address), commercial information (your plan and subscription status), internet activity (basic server logs) and the content you save (your prompts), only for the purposes described in this policy. We do not sell your personal information or share it for cross-context behavioral advertising, and we do not use sensitive personal information to infer characteristics about you. To make a request, email ${mail} from the address on your account; we may need to verify it is you, and you can use an authorized agent to ask on your behalf.</p>
<h2>Storage on your device</h2><p>The web app keeps your sign-in session in your browser's local storage, and the mobile app keeps it in the device's secure storage. We use no advertising or cross-site tracking cookies. If you subscribe, Stripe's checkout and billing pages are run by Stripe and may set their own cookies, for example to prevent fraud.</p>
<h2>Your choices</h2><ul>
<li><strong>Export:</strong> in the app, go to Settings → Your data → Export library to download everything as a JSON file.</li>
<li><strong>Edit or delete prompts:</strong> at any time, in the app. A deleted prompt stays in Recently deleted for 30 days so you can restore it, then it is permanently erased. To erase one sooner, open Settings → Recently deleted and choose Delete forever.</li>
<li><strong>Delete your account:</strong> in the app, go to Settings → Delete account. This permanently deletes your account and every prompt in your library. If you have a Pro subscription, deleting your account also cancels it. Copies in provider backups are removed on their normal backup cycle. Stripe and we keep billing records, such as invoices and payment history, for as long as tax and accounting law requires, even after your account is deleted.</li>
<li><strong>Manage your subscription:</strong> in the app, go to Settings → Manage subscription to change your payment method, see invoices or cancel.</li>
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
<h2>Who we are</h2><p>${esc(BRAND_NAME)} is operated by ${esc(cfg.operatorName)}, ${esc(cfg.operatorAddress)} ("we", "us").</p>
<h2>Your account</h2><p>You are responsible for your account and for keeping your password secure. Give us accurate information, and tell us at ${mail} if you think your account has been accessed without your permission. You must be at least 13 years old to use the service.</p>
<h2>Your content</h2><p>You keep ownership of the prompts you save. You give us the limited right to store, process and display them to you, and to make them available to assistants you connect, solely to provide the service. Only save content you have the right to save, and do not store anything unlawful or anything that infringes someone else's rights.</p>
<h2>Plans and Pro subscriptions</h2><ul>
<li><strong>Free and Pro.</strong> The free plan lets you save up to 25 prompts. Pro removes that limit. Prices and billing periods (monthly or yearly) are shown at checkout before you pay.</li>
<li><strong>Taxes.</strong> Prices do not include sales tax, VAT or similar taxes. Where we are required to collect them, they are calculated and shown at checkout before you pay.</li>
<li><strong>Payments.</strong> Pro is bought on the web app through Stripe. By subscribing you authorize us, through Stripe, to charge your payment method each billing period until you cancel. Subscriptions renew automatically, and you are charged in advance for each period.</li>
<li><strong>Cancelling.</strong> You can cancel at any time in Settings → Manage subscription. Pro stays active until the end of the period you have paid for, and then it does not renew. Fees already paid are not refunded for the rest of a period, except where the law requires. If you think you were charged by mistake, email ${mail} within 14 days of the charge and we will review it.</li>
<li><strong>Failed payments.</strong> If a payment fails we may retry it, and we may end Pro if it cannot be collected.</li>
<li><strong>Price changes.</strong> If we change the price, we will tell you before it applies, and it will take effect from your next renewal at the earliest.</li>
<li><strong>If Pro ends.</strong> You keep all of your prompts and can still read, edit, delete and export them. You will not be able to save new prompts while you are over the free limit.</li></ul>
<h2>Connected assistants</h2><p>When you connect an AI assistant, you authorize it to read your library and to add and edit prompts in it on your behalf. You are responsible for deciding which assistants to connect. You can revoke access at any time, and we are not responsible for how a third-party assistant uses what it reads or for changes it makes at your direction. Review what an assistant proposes to save or change before approving it.</p>
<h2>Acceptable use</h2><p>Do not misuse the service. That includes trying to access other users' data or our systems without permission, probing or testing for vulnerabilities without our written consent, interfering with or overloading the service, using it to send spam or malware, or reselling access to it.</p>
<h2>AI output</h2><p>Extraction and search can be imperfect. Review prompts before you rely on them, and use any prompt and any assistant's output at your own judgment.</p>
<h2>Availability and changes</h2><p>We work to keep ${esc(BRAND_NAME)} running, but it may be unavailable at times, and we may change, add or remove features. If we make a material change to these terms, we will update the date above and, where appropriate, tell you in the app or by email. Continuing to use the service after a change means you accept it.</p>
<h2>Ending your account</h2><p>You can delete your account at any time in Settings, which permanently deletes your library and cancels any Pro subscription (no refund is given for the remainder of a paid period). We may suspend or end accounts that break these terms or put the service or other users at risk.</p>
<h2>No warranty</h2><p>The service is provided "as is" and "as available", without warranties of any kind, to the extent the law allows.</p>
<h2>Limitation of liability</h2><p>To the extent the law allows, we are not liable for indirect, incidental or consequential damages, or for lost data, profits or revenue, arising from your use of the service. Please export anything you cannot afford to lose. Nothing in these terms limits liability that cannot be limited by law.</p>
<h2>Governing law</h2><p>These terms are governed by the laws of ${esc(cfg.governingLaw)}, without regard to its conflict-of-law rules. Disputes will be brought in the courts of that place, unless the law where you live gives you the right to bring a claim somewhere else or protects you with mandatory rules that cannot be waived.</p>
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
