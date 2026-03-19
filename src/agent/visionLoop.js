import { captureScreen } from "../tools/screen.js";
import { analyzeScreen } from "../ai/vision.js";
import { mouse, screen, straightTo, Point } from "@nut-tree-fork/nut-js";

async function getDynamicCoords(region) {
  const width = await screen.width();
  const height = await screen.height();

  const map = {
    "top-left": { x: width * 0.1, y: height * 0.1 },
    "top-center": { x: width * 0.5, y: height * 0.1 },
    "top-right": { x: width * 0.9, y: height * 0.1 },
    center: { x: width * 0.5, y: height * 0.5 },
    "bottom-left": { x: width * 0.1, y: height * 0.9 },
    "bottom-right": { x: width * 0.9, y: height * 0.9 },
  };
  return map[region] || map["center"];
}

export async function runVisionLoop(goal) {
  console.log("Capturing screen...");
  const imgPath = await captureScreen();

  console.log("Analyzing...");
  let decision = await analyzeScreen(goal, imgPath);

  if (!decision) return "No decision from Vision model";

  if (decision.action !== "click") {
    decision = goal?.includes("search")
      ? { action: "click", target: "top-center" }
      : { action: "click", target: "center" };
  }

  if (decision.action === "click") {
    const coords = await getDynamicCoords(decision.target);
    if (!coords) return "Invalid region";

    // VISUALLY MOVE THE MOUSE
    await mouse.move(straightTo(new Point(coords.x, coords.y)));
    await mouse.leftClick();
    return `Clicked ${decision.target} at [${Math.round(coords.x)}, ${Math.round(coords.y)}]`;
  }

  return "No action taken";
}
