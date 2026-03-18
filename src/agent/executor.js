import { clickMouse } from "../tools/mouse.js";
import { runCommand } from "../tools/terminal.js";
import { readFile, writeFile } from "../tools/file.js";
import { captureScreen } from "../tools/screen.js";
import { openBrowser, searchWeb } from "../tools/browser.js";
import { runVisionLoop } from "./visionLoop.js";
import { clickByText } from "./textClick.js";
import { verifyAction } from "../ai/vision.js"; // Verification Logic

/* ---------------- JSON EXTRACT ---------------- */

function extractJSON(text) {
  const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

/* ---------------- NORMALIZE ---------------- */

function normalizeAction(action) {
  if (!action) return null;

  if (!action.tool && action.action) action.tool = action.action;

  const data =
    action.data || action.arguments || action.params || action.args || {};

  // Dynamic mapping to ensure "text", "url", and "goal" are always found
  action.path = action.path || data.path || data.filename;
  action.content = action.content || data.content || data.value || data.text;
  action.url = action.url || data.url;
  action.query = action.query || data.query;
  action.goal = action.goal || data.goal;
  action.text = action.text || data.text;

  // Fix for the specific error you saw: "args": ["File"]
  if (Array.isArray(action.args) && action.args.length > 0) {
    if (!action.text) action.text = action.args[0];
    if (!action.url) action.url = action.args[0];
  }

  if (action.path) {
    action.path = action.path
      .replace("/path/to/", "")
      .replace(/^\/+/, "")
      .trim();
  }

  return action;
}

/* ---------------- EXECUTE SINGLE + VERIFY ---------------- */

async function executeSingle(action) {
  if (!action) return "Invalid action";
  let result = "";

  // 1. Run the Tool
  if (action.tool === "mouse_click") {
    result = await clickMouse();
  } else if (action.tool === "run_command") {
    result = await runCommand(action.command);
  } else if (action.tool === "read_file") {
    result = await readFile(action.path);
  } else if (action.tool === "write_file") {
    result = await writeFile(action.path, action.content || "");
  } else if (action.tool === "capture_screen") {
    result = await captureScreen();
  } else if (action.tool === "open_browser") {
    result = await openBrowser(action.url);
  } else if (action.tool === "search_google") {
    result = await searchWeb(action.query);
  } else if (action.tool === "vision_loop") {
    result = await runVisionLoop(action.goal);
  } else if (action.tool === "click_text") {
    result = await (action.text
      ? clickByText(action.text)
      : "Missing text for click_text");
  } else {
    return "Unknown tool: " + action.tool;
  }

  // 2. The Jarvis Verification Step
  // Only verify visual actions (clicks/browser)
  const visualTools = [
    "mouse_click",
    "vision_loop",
    "click_text",
    "open_browser",
  ];
  if (visualTools.includes(action.tool)) {
    console.log(`[Jarvis] Action performed. Verifying...`);

    // Wait for the UI to react (menu opening, page loading)
    await new Promise((r) => setTimeout(r, 1200));

    await captureScreen(); // Take a fresh screenshot of the result

    const context = action.text || action.goal || action.url || "the action";
    const verification = await verifyAction(context, result);

    if (!verification.success) {
      return `${result}. ⚠️ VERIFICATION FAILED: ${verification.observation}`;
    }
    return `${result}. ✅ VERIFIED: ${verification.observation}`;
  }

  return result;
}

/* ---------------- MAIN EXECUTOR ---------------- */

export async function execute(plan) {
  let action = extractJSON(plan);
  if (!action) return "Invalid plan from AI";

  if (Array.isArray(action)) {
    const results = [];
    for (let step of action) {
      const normalized = normalizeAction(step);
      const res = await executeSingle(normalized);
      results.push(res);
    }
    return results.join("\n");
  }

  return await executeSingle(normalizeAction(action));
}
