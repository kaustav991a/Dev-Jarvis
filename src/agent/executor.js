import { clickMouse } from "../tools/mouse.js";
import { runCommand } from "../tools/terminal.js";
import { readFile, writeFile } from "../tools/file.js";
import { captureScreen } from "../tools/screen.js";
import { openBrowser, searchWeb } from "../tools/browser.js";

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

    if (!action.url && action.data.url) {
      action.url = action.data.url;
    }

    if (!action.query && action.data.query) {
      action.query = action.data.query;
    }
  }

  /* ---------- ARGUMENTS ---------- */

  if (action.arguments) {
    if (!action.url && action.arguments.url) {
      action.url = action.arguments.url;
    }

    if (!action.query && action.arguments.query) {
      action.query = action.arguments.query;
    }

    if (!action.path && action.arguments.filename) {
      action.path = action.arguments.filename;
    }

    if (!action.path && action.arguments.path) {
      action.path = action.arguments.path;
    }

    if (!action.content && action.arguments.content) {
      action.content = action.arguments.content;
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
    // if (action.params) {
    if (!action.url && action.params.url) {
      action.url = action.params.url;
    }

    if (!action.query && action.params.query) {
      action.query = action.params.query;
    }
    // }
  }

  /* ---------- ARGS ARRAY ---------- */

  if (action.args && Array.isArray(action.args)) {
    if (!action.url && action.args.length > 0) {
      action.url = action.args[0];
    }

    if (!action.query && action.args.length > 0) {
      action.query = action.args[0];
    }
  }

  /* ---------- ARGS OBJECT ---------- */

  if (
    action.args &&
    typeof action.args === "object" &&
    !Array.isArray(action.args)
  ) {
    if (!action.url && action.args.url) {
      action.url = action.args.url;
    }

    if (!action.query && action.args.query) {
      action.query = action.args.query;
    }

    if (!action.path && action.args.filename) {
      action.path = action.args.filename;
    }

    if (!action.content && action.args.content) {
      action.content = action.args.content;
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

  if (action.tool === "open_browser") {
    if (!action.url) {
      return "Missing browser URL";
    }

    return await openBrowser(action.url);
  }

  if (action.tool === "search_google") {
    return await searchWeb(action.query);
  }
  

  return "Unknown tool";
}
