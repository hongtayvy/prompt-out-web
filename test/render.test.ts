import { describe, it, expect } from "vitest";
import { BRAND_NAME } from "../src/brand.js";
import { renderConsent, renderIndex, renderPrivacy, renderTerms } from "../src/render.js";

const cfg = { supabaseUrl: "https://p.supabase.co", supabaseAnonKey: "anon-key", mcpUrl: "https://mcp.test/mcp", appUrl: "https://app.test", contactEmail: "a@b.co" };

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
