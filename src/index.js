import readline from "readline";
import { isSafeRequest } from "./security/filter.js";
import { planTask } from "./agent/planner.js";
import { execute } from "./agent/executor.js";
import { addMemory } from "./memory/memory.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Jarvis Agent Started");

rl.on("line", async (input) => {
  const plan = await planTask(input);

  console.log("AI plan:", plan);

  const result = await execute(plan);

  console.log("Result:", result);

  addMemory({
    task: input,
    plan: plan,
    result: result,
  });
});
