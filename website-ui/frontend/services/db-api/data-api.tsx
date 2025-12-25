const API_URL = "http://localhost:5001/data";
const QUERY_DATA_URL = "http://localhost:5001/query_data";

export async function getData() {
  const response = await fetch(`${API_URL}/retrieve`);
  return response.json();
}

export async function postData(data: any) {
  const response = await fetch(`${API_URL}/insert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function getQueryData() {
  const response = await fetch(`${QUERY_DATA_URL}/retrieve`);
  return response.json();
}

export async function postQueryData(data: { content: string; source: string; category: string }) {
  const response = await fetch(`${QUERY_DATA_URL}/insert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}