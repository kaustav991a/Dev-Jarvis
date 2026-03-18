import fs from "fs";

/**
 * Finds where to click based on a goal.
 * Used by: visionLoop.js
 */
export async function analyzeScreen(goal = "") {
  const image = fs.readFileSync("workspace/screen.png", { encoding: "base64" });

  const res = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llava",
      prompt: `
      User goal: "${goal}"
      You are controlling a computer screen. Find where the user should click.
      
      Rules:
      - Always choose the MOST LIKELY location.
      - Return ONLY JSON.
      
      Example: { "action": "click", "target": "top-left" }
      `,
      images: [image],
      stream: false,
    }),
  });

  const data = await res.json();
  try {
    return JSON.parse(data.response);
  } catch {
    console.log("VISION RAW:", data.response);
    return null;
  }
}

/**
 * Verifies if a previous action actually worked.
 * Used by: executor.js
 */
export async function verifyAction(goal, actionTaken) {
  const image = fs.readFileSync("workspace/screen.png", { encoding: "base64" });

  const res = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llava",
      prompt: `
      The user goal was: "${goal}"
      The action taken was: "${actionTaken}"
      
      Look at the current screen. Did the action work? 
      (e.g., if we clicked "File", is the menu now open?)
      
      Return ONLY JSON:
      {
        "success": true | false,
        "observation": "What do you see now?"
      }
      `,
      images: [image],
      stream: false,
    }),
  });

  const data = await res.json();
  try {
    // LLava sometimes adds text before JSON, let's extract it safely
    const match = data.response.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : data.response);
  } catch {
    return { success: false, observation: "Could not verify screen state." };
  }
}
