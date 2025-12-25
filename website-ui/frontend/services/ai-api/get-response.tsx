const AI_API_URL = "http://localhost:8001/ai";

export async function askAI(question: string) {
  const response = await fetch(`${AI_API_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });
  return response.json();
}