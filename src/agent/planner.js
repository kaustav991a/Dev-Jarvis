import { askLLM } from "../ai/llm.js";
import { getMemory } from "../memory/memory.js";

const memory = JSON.stringify(getMemory(), null, 2);

export async function planTask(task) {
  const prompt = `
You are a computer automation agent.

Recent memory:
${memory}

Choose ONE tool and respond ONLY in JSON.

Available tools:

mouse_click
run_command
read_file
write_file
capture_screen

Task: ${task}
`;

  const response = await askLLM(prompt);

  return response.trim();
}
