import { BRAND_NAME } from "./brand.js";

/** All user-facing product copy lives here so the name and wording can be swapped in one place. */
export const COPY = {
  name: BRAND_NAME,
  tagline: "Capture any AI prompt. Use it anywhere.",
  pitch: `${BRAND_NAME} saves the prompts you find online into a private library, then lets Claude, ChatGPT and Cursor pull them straight into context over MCP. No copy-paste.`,
  mcpConnectHelp: `Add this URL as a custom connector (Claude), a remote MCP server (Cursor, VS Code) or a Developer Mode connector (ChatGPT), then sign in with your ${BRAND_NAME} account.`,
  extractNotFound: "We couldn't find a reusable prompt in that text. Try pasting just the prompt itself.",
} as const;
