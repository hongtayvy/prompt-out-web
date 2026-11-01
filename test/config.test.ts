import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadSiteConfig } from "../src/config.js";

const file = (obj: object) => {
  const p = join(mkdtempSync(join(tmpdir(), "cfg-")), "site.config.json");
  writeFileSync(p, JSON.stringify(obj));
  return p;
};
const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");

describe("loadSiteConfig", () => {
  it("uses file defaults and lets env override", () => {
    const p = file({ supabaseUrl: "https://a.supabase.co/", supabaseAnonKey: "sb_publishable_x", contactEmail: "a@b.co" });
    expect(loadSiteConfig({}, p)).toMatchObject({ supabaseUrl: "https://a.supabase.co", supabaseAnonKey: "sb_publishable_x", contactEmail: "a@b.co" });
    expect(loadSiteConfig({ CONTACT_EMAIL: "z@b.co" }, p).contactEmail).toBe("z@b.co");
  });
  it("works with no file at all", () => {
    expect(loadSiteConfig({}, "/nonexistent.json").supabaseUrl).toBe("");
  });
  it("refuses secret keys in either place", () => {
    expect(() => loadSiteConfig({ SUPABASE_ANON_KEY: "sb_secret_abc" })).toThrow(/secret/i);
    const jwt = `h.${b64({ role: "service_role" })}.s`;
    expect(() => loadSiteConfig({ SUPABASE_ANON_KEY: jwt })).toThrow(/service-role|secret/i);
    expect(() => loadSiteConfig({}, file({ supabaseAnonKey: "sb_secret_abc" }))).toThrow();
  });
  it("reads the app URL from the file, lets env override it, and trims a trailing slash", () => {
    const p = file({ appUrl: "https://my.example.app/" });
    expect(loadSiteConfig({}, p).appUrl).toBe("https://my.example.app");
    expect(loadSiteConfig({ APP_URL: "https://other.app" }, p).appUrl).toBe("https://other.app");
  });
  it("refuses an app URL that is not http(s)", () => {
    expect(() => loadSiteConfig({ APP_URL: "javascript:alert(1)" })).toThrow(/http/i);
    expect(() => loadSiteConfig({}, file({ appUrl: 'https://x.test/"onmouseover="x' }))).toThrow(/http/i);
  });
  it("accepts a legacy anon JWT", () => {
    const jwt = `h.${b64({ role: "anon" })}.s`;
    expect(loadSiteConfig({ SUPABASE_ANON_KEY: jwt }).supabaseAnonKey).toBe(jwt);
  });
});
