const blockedWords = [
  "delete",
  "format",
  "shutdown",
  "powershell",
  "system32",
  "registry",
];

export function isSafeRequest(text) {
  const lower = text.toLowerCase();

  for (const word of blockedWords) {
    if (lower.includes(word)) {
      return false;
    }
  }

  return true;
}
