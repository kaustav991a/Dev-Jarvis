import fs from "fs/promises";
import path from "path";
import { isSafePath } from "../security/pathGuard.js";

export async function readFile(filePath) {
  const fullPath = path.resolve("./workspace", filePath);

  if (!isSafePath(fullPath)) {
    return "Access denied";
  }

  try {
    const data = await fs.readFile(fullPath, "utf-8");
    return data;
  } catch {
    return "File not found";
  }
}

export async function writeFile(filePath, content) {
  const fullPath = path.resolve("./workspace", filePath);

  if (!isSafePath(fullPath)) {
    return "Access denied";
  }

  try {
    await fs.writeFile(fullPath, content);

    return "File written";
  } catch {
    return "Write failed";
  }
}
