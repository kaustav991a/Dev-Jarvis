import { askLLM } from "../ai/llm.js";
import { getMemory } from "../memory/memory.js";

export async function planTask(task, lastResult = "") {
  const history = getMemory();

  const memoryString = history
    .map((m) => {
      const shortResult =
        m.result.length > 150
          ? m.result.substring(0, 150) + "... [truncated]"
          : m.result;
      return `Action: ${JSON.stringify(m.plan)}\nResult: ${shortResult}`;
    })
    .join("\n---\n");

  const prompt = `
You are J.A.R.V.I.S., an autonomous AI. 
Your ultimate goal: "${task}"

Recent History:
${memoryString}

Last Action Result: 
${lastResult}

AVAILABLE TOOLS:
--- NATIVE WEB CONTROL ---
1. {"tool": "open_browser", "url": "https://example.com"} - Opens a website.
2. {"tool": "web_analyze"} - Returns the IDs of all buttons/inputs. YOU MUST DO THIS BEFORE CLICKING OR TYPING.
3. {"tool": "web_click", "id": "5"} - Clicks an element by ID.
4. {"tool": "web_type", "id": "12", "text": "query"} - Types text into an ID.

--- DESKTOP CONTROL ---
5. {"tool": "click_text", "text": "File"} - Clicks text on the screen via OCR.
6. {"tool": "run_command", "command": "cmd"} - Runs terminal commands.
7. {"tool": "read_file", "path": "file.txt"} - Reads a local file.
8. {"tool": "write_file", "path": "file.txt", "content": "data"} - Writes data to a file.

--- SYSTEM ---
9. {"tool": "task_complete", "message": "I have finished the task."} - USE THIS ONLY WHEN THE ULTIMATE GOAL IS ACHIEVED.
10. {"tool": "run_command", "command": "cmd"} - Runs terminal commands.

STRATEGY:
- To open websites, search the web, or go to Google, you MUST use the "open_browser" tool. NEVER use "run_command" to open URLs.
- If you opened a browser, your very next tool MUST be "web_analyze" so you can read the page.
- "web_type" MUST ONLY be used on elements labeled as "input" or "textarea". NEVER try to type into a "button", "a", or "div".
- Look at the "Last Action Result" to find the correct element IDs you need.

Respond ONLY with raw JSON. No markdown formatting. No explanation.
`;

  const response = await askLLM(prompt);
  return response.trim();
}
