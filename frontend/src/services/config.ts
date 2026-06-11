/**
 * Service de configuration pour l'application MAGRO
 */

export interface AppConfig {
  // API Backend
  apiBaseUrl: string;

  // Authentification Google
  googleClientId?: string;

  // Mode développement
  isDevelopment: boolean;
}

function loadConfig(): AppConfig {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";
  const isDevelopment = import.meta.env.MODE !== "production";

  return {
    apiBaseUrl,
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    isDevelopment
  };
}

let config: AppConfig | null = null;

/**
 * Retourne la configuration de l'application
 */
export function getConfig(): AppConfig {
  if (!config) {
    config = loadConfig();
  }
  return config;
}

/**
 * Réinitialise la configuration (utile pour les tests)
 */
export function resetConfig(): void {
  config = null;
}
