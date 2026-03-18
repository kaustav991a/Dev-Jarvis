import { askLLM } from "../ai/llm.js";
import { getMemory } from "../memory/memory.js";

export async function planTask(task) {
  const history = getMemory();
  const memoryString = history
    .map((m) => `Task: ${m.task}\nResult: ${m.result}`)
    .join("\n---\n");

  const prompt = `
You are Jarvis, a computer automation agent.
Goal: ${task}

Current Memory:
${memoryString}

TOOLS:
1. click_text: {"tool": "click_text", "text": "Label"} 
   - Use this to click menus or buttons with names (e.g., "File", "Save", "Terminal").
2. vision_loop: {"tool": "vision_loop", "goal": "description"} 
   - Use this for icons or things without text (e.g., "The red X button").
3. mouse_click: {"tool": "mouse_click"} 
   - ONLY use if you just moved the mouse to the right spot.

RESPONSE RULE: Respond ONLY with a JSON object. No words.
`;

  const response = await askLLM(prompt);
  return response.trim();
}
