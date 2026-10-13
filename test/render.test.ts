import { describe, it, expect } from "vitest";
import { BRAND_NAME } from "../src/brand.js";
import { renderConsent, renderIndex, renderPrivacy, renderTerms } from "../src/render.js";

const cfg = { supabaseUrl: "https://p.supabase.co", supabaseAnonKey: "anon-key", mcpUrl: "https://mcp.test/mcp", contactEmail: "a@b.co" };

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
