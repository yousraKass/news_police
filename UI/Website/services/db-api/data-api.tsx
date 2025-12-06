const API_URL = "http://localhost:5001/data";

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