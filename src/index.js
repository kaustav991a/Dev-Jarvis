import readline from "readline";
import { isSafeRequest } from "./security/filter.js";
import { planTask } from "./agent/planner.js";
import { execute } from "./agent/executor.js";
import { addMemory } from "./memory/memory.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Jarvis Agent Started. Type a task...");

rl.on("line", async (input) => {
  if (!isSafeRequest(input)) {
    console.log("Blocked by security policy.");
    return;
  }

  try {
    const plan = await planTask(input);
    console.log("AI Plan:", plan);

    const result = await execute(plan);
    console.log("Result:", result);

    // This updates the memory that planner.js imports
    addMemory({
      task: input,
      plan: plan,
      result: result,
    });

    console.log("\nReady for next command:");
  } catch (err) {
    console.error("Execution Error:", err);
  }
});
