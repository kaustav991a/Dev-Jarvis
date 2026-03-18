export async function askLLM(prompt) {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      prompt: prompt,
      stream: false,
      format: "json", // Forces Ollama to output valid JSON
    }),
  });

  const data = await res.json();
  return data.response;
}
