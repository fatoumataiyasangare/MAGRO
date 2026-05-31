const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";
const ACCESS_TOKEN_KEY = "magro_access_token";

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) ?? undefined;
}

export function setStoredAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearStoredAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export async function apiFetch<T>(path: string, options: RequestInit = {}, accessToken?: string): Promise<T> {
  const token = accessToken ?? getStoredAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  } as Record<string, string>;

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || response.statusText || "Request failed");
  }

  return response.json();
}
