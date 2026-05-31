import { apiFetch, clearStoredAccessToken, setStoredAccessToken } from "./api";
import { fetchWithFallback, getConfig } from "./config";

export type UserRole = "BUYER" | "FARMER" | "REGULATOR";

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
}

/**
 * Demande l'envoi d'un code OTP par SMS
 * Utilise la logique de bascule automatique entre API réelle et mode simulé
 */
export async function requestOtp(phone: string) {
  return fetchWithFallback(
    () => apiFetch<{ message: string }>("/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ phone })
    }),
    { message: "OTP envoyé (mode simulé)" },
    "Erreur lors de la demande d'OTP"
  );
}

/**
 * Vérifie un code OTP et connecte l'utilisateur
 * Utilise la logique de bascule automatique entre API réelle et mode simulé
 */
export async function verifyOtp(phone: string, otp: string) {
  const cfg = getConfig();
  
  // En mode développement avec API non disponible, simuler la vérification
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    console.log(`[Mock Auth] Vérification OTP simulée pour ${phone}`);
    
    // Créer un utilisateur fictif
    const mockUser: UserProfile = {
      id: "mock-user-" + Date.now(),
      phone: phone,
      name: "Utilisateur " + phone.slice(-4),
      role: "BUYER"
    };
    
    const mockToken = "mock-access-token-" + Date.now();
    setStoredAccessToken(mockToken);
    
    return { user: mockUser, accessToken: mockToken };
  }
  
  const payload = await apiFetch<{ user: UserProfile; accessToken: string }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otp })
  });

  setStoredAccessToken(payload.accessToken);
  return payload;
}

/**
 * Récupère le profil utilisateur
 * Utilise la logique de bascule automatique entre API réelle et mode simulé
 */
export async function fetchProfile() {
  const cfg = getConfig();
  const token = localStorage.getItem("magro_access_token");
  
  // En mode développement sans token, retourner un profil fictif
  if (!cfg.isApiAvailable || cfg.mockDataEnabled || !token) {
    console.log("[Mock Auth] Profil utilisateur simulé");
    return {
      id: "mock-user",
      phone: "+22370123456",
      name: "Utilisateur Test",
      role: "BUYER"
    };
  }
  
  return apiFetch<UserProfile>("/profile");
}

/**
 * Déconnecte l'utilisateur
 * Utilise la logique de bascule automatique entre API réelle et mode simulé
 */
export async function logout() {
  clearStoredAccessToken();
  
  return fetchWithFallback(
    () => apiFetch<{ message: string }>("/auth/logout", {
      method: "POST"
    }),
    { message: "Déconnecté (mode simulé)" },
    "Erreur lors de la déconnexion"
  );
}

/**
 * Met à jour le rôle de l'utilisateur
 * Utilise la logique de bascule automatique entre API réelle et mode simulé
 */
export async function updateRole(role: UserRole) {
  const cfg = getConfig();
  const token = localStorage.getItem("magro_access_token");
  
  // En mode développement sans token, simuler la mise à jour
  if (!cfg.isApiAvailable || cfg.mockDataEnabled || !token) {
    console.log(`[Mock Auth] Mise à jour du rôle simulée: ${role}`);
    return {
      id: "mock-user",
      phone: "+22370123456",
      name: "Utilisateur Test",
      role: role
    };
  }
  
  return apiFetch<UserProfile>("/profile/role", {
    method: "PATCH",
    body: JSON.stringify({ role })
  });
}
