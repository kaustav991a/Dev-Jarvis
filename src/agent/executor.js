import { clickMouse } from "../tools/mouse.js";
import { runCommand } from "../tools/terminal.js";
import { readFile, writeFile } from "../tools/file.js";
import { captureScreen } from "../tools/screen.js";
// import { openBrowser, searchWeb } from "../tools/browser.js";
import { runVisionLoop } from "./visionLoop.js";
import { clickByText } from "./textClick.js";
import { verifyAction } from "../ai/vision.js";
import {
  openBrowser,
  analyzeWebPage,
  clickWebElement,
  typeWebElement,
} from "../tools/browser.js";

/* ---------------- JSON EXTRACT ---------------- */
function extractJSON(text) {
  if (typeof text === "object") return text;
  try {
    const cleanText = String(text)
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const match = cleanText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);

    let parsed = JSON.parse(match ? match[0] : cleanText);

    // Fix for nested task hallucinations
    if (parsed.task && parsed.task.tool) {
      parsed = parsed.task;
    }

    return parsed;
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

  action.path = action.path || data.path || data.filename;
  action.content = action.content || data.content || data.value || data.text;
  action.url = action.url || data.url;
  action.query = action.query || data.query;
  action.goal = action.goal || data.goal;
  action.text = action.text || data.text;

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

  // OS & File Tools
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
  }

  // NATIVE WEB TOOLS (No OCR Required!)
  else if (action.tool === "open_browser") {
    result = await openBrowser(action.url);
  } else if (action.tool === "web_analyze") {
    result = await analyzeWebPage();
  } else if (action.tool === "web_click") {
    result = await clickWebElement(action.element_id || action.id);
  } else if (action.tool === "web_type") {
    result = await typeWebElement(
      action.element_id || action.id,
      action.text || action.value,
    );
  }

  // LEGACY OCR TOOLS (For OS-level apps like VS Code)
  else if (action.tool === "vision_loop") {
    result = await runVisionLoop(action.goal);
  } else if (action.tool === "click_text") {
    if (!action.text) return "Missing text for click_text";
    result = await clickByText(action.text);

    if (
      result.includes("coordinates are invalid") ||
      result.includes("Could not find") ||
      result.includes("OCR failed")
    ) {
      console.log(
        `[Jarvis] OCR failed to locate "${action.text}". Switching to Vision Fallback...`,
      );
      const visionResult = await runVisionLoop(
        `Find and click the ${action.text} button or menu`,
      );
      result = `OCR Failed. Vision Fallback Result: ${visionResult}`;
    }
  } else {
    return "Unknown tool: " + action.tool;
  }

  // Verification step (Only verify OS-level visual tools now, the Web tools verify themselves)
  const visualTools = ["mouse_click", "vision_loop", "click_text"];
  if (visualTools.includes(action.tool)) {
    console.log(`[Jarvis] Action performed. Verifying...`);
    console.log(`[Jarvis] 📸 Taking post-action screenshot...`);

    await new Promise((r) => setTimeout(r, 1200));
    const finalImgPath = await captureScreen();
    console.log(`[Jarvis] 🧠 Asking Vision model to verify...`);
    const context = action.text || action.goal || action.url || "the action";
    const verification = await verifyAction(context, result, finalImgPath);

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
