const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = envBaseUrl && !envBaseUrl.includes("localhost") 
  ? envBaseUrl 
  : `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:4000/api/v1`;

let inMemoryAccessToken: string | undefined;

export function getStoredAccessToken() {
  return inMemoryAccessToken;
}

export function setStoredAccessToken(token: string) {
  inMemoryAccessToken = token;
}

export function clearStoredAccessToken() {
  inMemoryAccessToken = undefined;
}

export function triggerGlobalError(message: string, originalError?: any) {
  const appEnv = import.meta.env.VITE_APP_ENV || "test";
  
  if (appEnv === "prod") {
    // En mode prod, on arrête l'exécution pour ne pas utiliser les fausses données
    throw originalError || new Error(message);
  }

  // En mode test, on utilise les fausses données SILENCIEUSEMENT
  // (Pas de toast affiché pour les erreurs backend)
}

async function refreshAccessToken() {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    clearStoredAccessToken();
    return undefined;
  }

  const payload = await response.json() as { accessToken?: string };
  if (payload.accessToken) {
    setStoredAccessToken(payload.accessToken);
  }

  return payload.accessToken;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}, accessToken?: string): Promise<T> {
  const token = accessToken ?? getStoredAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  } as Record<string, string>;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers
  });

  if (response.status === 401 && path !== "/auth/refresh") {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      return apiFetch<T>(path, options, refreshedToken);
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || "Request failed");
  }

  return response.json();
}
