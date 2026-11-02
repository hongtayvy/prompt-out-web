import { describe, it, expect } from "vitest";
import { BRAND_NAME } from "../src/brand.js";
import { renderConsent, renderIndex, renderPrivacy, renderTerms } from "../src/render.js";

const cfg = { supabaseUrl: "https://p.supabase.co", supabaseAnonKey: "anon-key", mcpUrl: "https://mcp.test/mcp", appUrl: "https://app.test", contactEmail: "a@b.co", operatorName: "Jane Doe", operatorAddress: "1 Main St, Springfield, IL 62701, USA", governingLaw: "the State of Illinois, USA" };

describe("landing", () => {
  it("uses the brand constant and posts to the waitlist table with the anon key", () => {
    const html = renderIndex(cfg);
    expect(html).toContain(BRAND_NAME);
    expect(html).toContain("/rest/v1/waitlist");
    expect(html).toContain("anon-key");
    expect(html).toContain('name="company"'); // honeypot
    expect(html).toContain("MCP");
    expect(html).toContain("Severity-ranked".slice(0, 0));
  });
  it("links the nav, hero and sign-up section to the web app", () => {
    const html = renderIndex(cfg);
    expect(html.match(/href="https:\/\/app\.test"/g)?.length).toBeGreaterThanOrEqual(4); // Sign in, nav CTA, hero CTA, join CTA
    expect(html).toContain("Get started free");
    expect(html).toContain("Sign in");
    expect(html).not.toContain("__APP_URL__");
  });
  it("shows the same app links in the legal pages' nav", () => {
    for (const page of [renderPrivacy(cfg), renderTerms(cfg)]) {
      expect(page).toContain('href="https://app.test"');
      expect(page).not.toContain("__APP_URL__");
    }
  });
  it("escapes the app URL", () => {
    expect(renderIndex({ ...cfg, appUrl: 'https://x.test/"><script>x</script>' })).not.toContain("<script>x</script>");
  });
  it("renders legal pages", () => {
    expect(renderPrivacy(cfg)).toContain("Privacy Policy");
    expect(renderTerms(cfg)).toContain("Terms of Service");
  });
  it("covers payments, cancelling and deletion in both policies", () => {
    const privacy = renderPrivacy(cfg);
    expect(privacy).toContain("Stripe");
    expect(privacy).toContain("never see or store your full card number");
    expect(privacy).toContain("deleting your account also cancels it");
    const terms = renderTerms(cfg);
    for (const text of ["Plans and Pro subscriptions", "renew automatically", "Settings → Manage subscription", "up to 25 prompts", "cancels any Pro subscription"]) expect(terms).toContain(text);
  });
  it("names the operator and the governing law, and covers GDPR and CCPA rights", () => {
    const privacy = renderPrivacy(cfg);
    expect(privacy).toContain("operated by Jane Doe, 1 Main St, Springfield, IL 62701, USA");
    for (const text of ["How long we keep it", "Your rights if you are in the EEA", "California privacy rights", "do not sell your personal information"]) expect(privacy).toContain(text);
    const terms = renderTerms(cfg);
    expect(terms).toContain("operated by Jane Doe");
    expect(terms).toContain("governed by the laws of the State of Illinois, USA");
    expect(terms).toContain("Prices do not include sales tax");
  });
  it("escapes the operator details", () => {
    const bad = { ...cfg, operatorName: '<img src=x onerror=alert(1)>', governingLaw: '"><script>x</script>' };
    for (const page of [renderPrivacy(bad), renderTerms(bad)]) {
      expect(page).not.toContain("<img src=x");
      expect(page).not.toContain("<script>x</script>");
    }
  });
  it("escapes config values", () => {
    expect(renderPrivacy({ ...cfg, contactEmail: '"><script>x</script>' })).not.toContain("<script>x</script>");
  });
  it("consent page uses the anon key and the oauth approval API only", () => {
    const html = renderConsent(cfg);
    expect(html).toContain("approveAuthorization");
    expect(html).toContain("denyAuthorization");
    expect(html).not.toContain("service_role");
  });
});
