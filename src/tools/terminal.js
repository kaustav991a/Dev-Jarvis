import { exec } from "child_process";

const allowedCommands = ["dir", "ls", "pwd", "echo", "git status", "node -v"];

export function runCommand(cmd) {
  if (!allowedCommands.includes(cmd)) {
    return Promise.resolve("Blocked by security policy");
  }

  return new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) resolve(stderr);
      else resolve(stdout);
    });
  });
}
