import { extractText } from "../ai/ocr.js";
import { captureScreen } from "../tools/screen.js";
import { mouse } from "@nut-tree-fork/nut-js";

export async function clickByText(target) {
  console.log(`[Jarvis] Searching for text: "${target}"`);

  // Step 1: Capture and Process
  const imgPath = await captureScreen();
  const words = await extractText(imgPath);

  if (!words || words.length === 0) {
    return "OCR failed: No text detected on screen.";
  }

  // Step 2: Smart Matching Logic
  const targetLower = target.toLowerCase();

  // Find all potential matches and score them
  const matches = words
    .map((w) => {
      const wordLower = w.text.toLowerCase();
      let score = 0;

      if (wordLower === targetLower)
        score = 100; // Perfect match
      else if (wordLower.includes(targetLower))
        score = 50; // Partial match
      else if (targetLower.includes(wordLower)) score = 30; // Fragment match

      return { ...w, score };
    })
    .filter((m) => m.score > 0);

  // Step 3: Select the Best Match
  if (matches.length === 0) {
    console.log(`⚠️ No match found for "${target}"`);
    return `Could not find "${target}" on screen.`;
  }

  // Sort by score (highest first) and then by size (larger buttons usually better)
  matches.sort((a, b) => b.score - a.score || b.w * b.h - a.w * a.h);

  const found = matches[0];

  if (found.w === 0 || found.h === 0) {
    return `Found "${found.text}" but coordinates are invalid.`;
  }

  // Step 4: Precise Clicking
  const centerX = Math.round(found.x + found.w / 2);
  const centerY = Math.round(found.y + found.h / 2);

  console.log(
    `[Jarvis] Match found: "${found.text}" (Score: ${found.score}) at [${centerX}, ${centerY}]`,
  );

  await mouse.setPosition({ x: centerX, y: centerY });
  await mouse.leftClick();

  return `Successfully clicked "${found.text}"`;
}
