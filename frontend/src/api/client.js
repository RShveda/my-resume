const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function fetchAPI(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}
