/**
 * Service de configuration pour détecter la disponibilité des APIs
 * et gérer la bascule automatique entre API réelle et mode simulé
 */

export interface AppConfig {
  // API Backend
  apiBaseUrl: string;
  isApiAvailable: boolean;
  
  // Service SMS
  smsApiEnabled: boolean;
  smsApiKey?: string;
  smsApiUrl?: string;
  
  // Authentification Google
  googleAuthEnabled: boolean;
  googleClientId?: string;
  
  // Mode développement
  mockDataEnabled: boolean;
  isDevelopment: boolean;
}

/**
 * Charge la configuration depuis les variables d'environnement
 */
function loadConfig(): AppConfig {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";
  const smsApiEnabled = import.meta.env.VITE_SMS_API_ENABLED === "true";
  const googleAuthEnabled = import.meta.env.VITE_GOOGLE_AUTH_ENABLED === "true";
  const isDevelopment = import.meta.env.MODE !== "production";
  const mockDataEnabled = isDevelopment && import.meta.env.VITE_MOCK_DATA_ENABLED === "true";

  // Vérifier si l'API backend est disponible
  const isApiAvailable = apiBaseUrl !== "" && apiBaseUrl !== "undefined";

  return {
    apiBaseUrl,
    isApiAvailable,
    smsApiEnabled,
    smsApiKey: import.meta.env.VITE_SMS_API_KEY,
    smsApiUrl: import.meta.env.VITE_SMS_API_URL,
    googleAuthEnabled,
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    mockDataEnabled,
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

/**
 * Vérifie si une fonctionnalité doit utiliser l'API réelle ou le mode simulé
 * @param featureName Nom de la fonctionnalité (sms, google, etc.)
 * @returns true si l'API réelle doit être utilisée, false sinon
 */
export function shouldUseRealApi(featureName: "sms" | "google" | "backend"): boolean {
  const cfg = getConfig();
  
  switch (featureName) {
    case "sms":
      return cfg.smsApiEnabled && !!cfg.smsApiKey && !!cfg.smsApiUrl;
    case "google":
      return cfg.googleAuthEnabled && !!cfg.googleClientId;
    case "backend":
      return cfg.isApiAvailable;
    default:
      return false;
  }
}

/**
 * Fonction utilitaire pour exécuter un appel API avec fallback automatique
 * @param apiCall Fonction d'appel API
 * @param fallbackData Données de fallback si l'API n'est pas disponible
 * @param errorMessage Message d'erreur personnalisé
 * @returns Données de l'API ou données de fallback
 */
export async function fetchWithFallback<T>(
  apiCall: () => Promise<T>,
  fallbackData: T,
  errorMessage?: string
): Promise<T> {
  const cfg = getConfig();
  
  // Si l'API n'est pas disponible ou si les données mockées sont activées
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    console.warn(
      errorMessage || 
      "API non disponible ou mode mock activé, utilisation des données de fallback"
    );
    return fallbackData;
  }
  
  try {
    return await apiCall();
  } catch (error) {
    console.warn(
      errorMessage || 
      "Erreur lors de l'appel API, utilisation des données de fallback",
      error
    );
    return fallbackData;
  }
}

/**
 * Log un message de développement pour indiquer où brancher l'API réelle
 * @param featureName Nom de la fonctionnalité
 * @param instructions Instructions pour brancher l'API
 */
export function logApiIntegrationPoint(featureName: string, instructions: string): void {
  const cfg = getConfig();
  if (cfg.isDevelopment) {
    console.log(`[API Integration] ${featureName}:`);
    console.log(`  Mode actuel: ${shouldUseRealApi(featureName as any) ? "API RÉELLE" : "MODE SIMULÉ"}`);
    console.log(`  Instructions: ${instructions}`);
  }
}
