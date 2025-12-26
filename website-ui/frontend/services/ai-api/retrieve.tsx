const AI_API_URL = "http://localhost:8001/ai";

export async function retrieveSimilarDocs(query: string, k: number = 4) {
  const response = await fetch(`${AI_API_URL}/retrieve?query=${encodeURIComponent(query)}&k=${k}`);
  return response.json();
}
