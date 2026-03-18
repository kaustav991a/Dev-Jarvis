import { captureScreen } from "../tools/screen.js";
import { analyzeScreen } from "../ai/vision.js";
import { mouse, screen } from "@nut-tree-fork/nut-js";

async function getDynamicCoords(region) {
  // Get actual screen dimensions at runtime
  const width = await screen.width();
  const height = await screen.height();

  const map = {
    "top-left": { x: width * 0.15, y: height * 0.15 },
    "top-center": { x: width * 0.5, y: height * 0.15 },
    "top-right": { x: width * 0.85, y: height * 0.15 },
    center: { x: width * 0.5, y: height * 0.5 },
    "bottom-left": { x: width * 0.15, y: height * 0.85 },
    "bottom-center": { x: width * 0.5, y: height * 0.85 },
    "bottom-right": { x: width * 0.85, y: height * 0.85 },
  };
  return map[region];
}

export async function runVisionLoop(goal) {
  console.log("Capturing screen...");
  await captureScreen();

  console.log("Analyzing...");
  let decision = await analyzeScreen(goal);

  if (!decision) return "No decision from Vision model";

  // Fallback logic remains the same
  if (decision.action !== "click") {
    decision = goal?.includes("search")
      ? { action: "click", target: "top-center" }
      : { action: "click", target: "center" };
  }

  if (decision.action === "click") {
    const coords = await getDynamicCoords(decision.target); // Use dynamic coords
    if (!coords) return "Invalid region";

    await mouse.setPosition(coords);
    await mouse.leftClick();
    return `Clicked ${decision.target} at [${Math.round(coords.x)}, ${Math.round(coords.y)}]`;
  }

  return "No action taken";
}
