import { extractText } from "../ai/ocr.js";
import { captureScreen } from "../tools/screen.js";
import { mouse, straightTo, Point } from "@nut-tree-fork/nut-js";

export async function clickByText(target) {
  console.log(`[Jarvis] Searching for text: "${target}"`);

  const imgPath = await captureScreen();
  const words = await extractText(imgPath);

  if (!words || words.length === 0) {
    return "OCR failed: No text detected on screen.";
  }

  const targetLower = target.toLowerCase();

  const matches = words
    .map((w) => {
      const wordLower = w.text.toLowerCase();
      let score = 0;
      if (wordLower === targetLower) score = 100;
      else if (wordLower.includes(targetLower)) score = 50;
      else if (targetLower.includes(wordLower)) score = 30;
      return { ...w, score };
    })
    .filter((m) => m.score > 0);

  if (matches.length === 0) {
    return `Could not find "${target}" on screen.`;
  }

  matches.sort((a, b) => b.score - a.score || b.w * b.h - a.w * a.h);
  const found = matches[0];

  if (found.w === 0 || found.h === 0) {
    return `Found "${found.text}" but coordinates are invalid.`;
  }

  const centerX = Math.round(found.x + found.w / 2);
  const centerY = Math.round(found.y + found.h / 2);

  console.log(`[Jarvis] Match found! Moving mouse to [${centerX}, ${centerY}]`);

  // VISUALLY MOVE THE MOUSE INSTEAD OF TELEPORTING
  await mouse.move(straightTo(new Point(centerX, centerY)));
  await mouse.leftClick();

  return `Successfully clicked "${found.text}"`;
}
