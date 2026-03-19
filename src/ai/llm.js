export async function askLLM(prompt) {
  // FIX: Using 127.0.0.1 instead of localhost prevents Node.js DNS resolution errors
  const res = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      prompt: prompt,
      stream: false,
      format: "json",
    }),
  });

  const data = await res.json();
  return data.response;
}
