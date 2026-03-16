import { clickMouse } from "../tools/mouse.js";
import { runCommand } from "../tools/terminal.js";
import { readFile, writeFile } from "../tools/file.js";
import { captureScreen } from "../tools/screen.js";

function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);

  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function normalizeAction(action) {
  if (!action) return null;

  /* action → tool */

  if (!action.tool && action.action) {
    action.tool = action.action;
  }

  /* ---------- DATA ---------- */

  if (action.data) {
    if (!action.path && action.data.filename) {
      action.path = action.data.filename;
    }

    if (!action.path && action.data.path) {
      action.path = action.data.path;
    }

    /* content variants */

    if (!action.content && action.data.content) {
      action.content = action.data.content;
    }

    if (!action.content && action.data.value) {
      action.content = action.data.value;
    }

    if (!action.content && action.data.text) {
      action.content = action.data.text;
    }
  }

  /* ---------- ARGUMENTS ---------- */

  if (action.arguments) {
    if (!action.path && action.arguments.filename) {
      action.path = action.arguments.filename;
    }

    if (!action.content && action.arguments.data) {
      action.content = action.arguments.data.join(" ");
    }
  }

  /* ---------- PARAMS ---------- */

  if (action.params) {
    if (!action.path && action.params.filename) {
      action.path = action.params.filename;
    }

    if (!action.path && action.params.path) {
      action.path = action.params.path;
    }

    if (!action.content && action.params.content) {
      action.content = action.params.content;
    }
  }

  /* ---------- SANITIZE PATH ---------- */

  if (action.path) {
    action.path = action.path
      .replace("/path/to/", "")
      .replace(/^\/+/, "")
      .trim();
  }

  return action;
}

export async function execute(plan) {
  let action = extractJSON(plan);

  if (!action) {
    return "Invalid plan from AI";
  }

  action = normalizeAction(action);

  if (action.tool === "mouse_click") {
    return await clickMouse();
  }

  if (action.tool === "run_command") {
    return await runCommand(action.command);
  }

  if (action.tool === "read_file") {
    return await readFile(action.path);
  }

  if (action.tool === "write_file") {
    if (!action.path) {
      return "Missing file path";
    }

    if (!action.content) {
      action.content = "";
    }

    return await writeFile(action.path, action.content);
  }

  if (action.tool === "capture_screen") {
    return await captureScreen();
  }

  return "Unknown tool";
}
