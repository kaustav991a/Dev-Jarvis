import readline from "readline";
import { isSafeRequest } from "./security/filter.js";
import { planTask } from "./agent/planner.js";
import { execute } from "./agent/executor.js";
import { addMemory } from "./memory/memory.js";
import { Spinner } from "./utils/spinner.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const spinner = new Spinner();

console.log("🚀 J.A.R.V.I.S. Autonomous Agent Started.");

rl.on("line", async (input) => {
  if (!isSafeRequest(input)) {
    console.log("🛑 Blocked by security policy.");
    return;
  }

  console.log(`\n🤖 Goal Received: "${input}"`);

  let stepCount = 0;
  const MAX_STEPS = 10;
  let lastResult = "Starting task.";

  // THE AUTONOMOUS LOOP
  while (stepCount < MAX_STEPS) {
    stepCount++;
    console.log(`\n--- [Step ${stepCount}/${MAX_STEPS}] ---`);

    try {
      // 1. Brain: Make a plan
      spinner.start("J.A.R.V.I.S. is thinking...");
      const planString = await planTask(input, lastResult);
      spinner.stop("🧠 Thought process complete.");

      const match = planString.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      const plan = JSON.parse(match ? match[0] : planString);

      console.log("📋 AI Intent:", JSON.stringify(plan));

      // 2. Check for completion
      if (plan.tool === "task_complete" || plan.action === "task_complete") {
        console.log(`\n✅ TASK COMPLETE: ${plan.message || "Done."}`);
        break;
      }

      // 3. Hands: Execute the plan
      spinner.start(`Executing tool: [${plan.tool}]...`);
      lastResult = await execute(JSON.stringify(plan));
      spinner.stop("⚙️ Action finished.");

      console.log(
        "📄 Result:",
        lastResult.substring(0, 300) +
          (lastResult.length > 300 ? "... [truncated]" : ""),
      );

      // 4. Memory
      addMemory({
        task: `Step ${stepCount} for goal: ${input}`,
        plan: plan,
        result: lastResult,
      });
    } catch (err) {
      spinner.stop(); // Make sure to stop the spinner if it crashes
      console.error("❌ Loop Error:", err.message);
      lastResult = `Error executing previous step: ${err.message}`;
    }
  }

  if (stepCount >= MAX_STEPS) {
    console.log("\n⚠️ Agent reached maximum step limit and paused for safety.");
  }

  console.log("\nReady for next command:");
});
