import path from "path";

const SAFE_DIR = path.resolve("./workspace");

export function isSafePath(target) {
  const resolved = path.resolve(target);

  return resolved.startsWith(SAFE_DIR);
}
