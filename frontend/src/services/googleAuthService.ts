/**
 * Service d'authentification Google utilisant @react-oauth/google
 * 
 * Ce service gère l'authentification via le popup Google réel.
 * Le Google Client ID est configuré dans .env (VITE_GOOGLE_CLIENT_ID).
 */

import { jwtDecode } from "jwt-decode";
import type { UserProfile } from "./auth";
import { apiFetch, setStoredAccessToken, triggerGlobalError } from "./api";

// Le credential Google est un JWT contenant ces champs
interface GoogleCredentialPayload {
  sub: string;       // Google user ID
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
}

/**
 * Decode un JWT Google (credential) sans vérification de signature.
 * En production, la vérification se fait côté backend.
 */
function decodeGoogleCredential(credential: string): GoogleCredentialPayload {
  try {
    return jwtDecode<GoogleCredentialPayload>(credential);
  } catch (error) {
    console.error("JWT decoding failed:", error);
    throw new Error("Failed to decode JWT");
  }
}

/**
 * Traite la réponse du popup Google pour la CONNEXION et renvoie un UserProfile.
 */
export async function handleGoogleLogin(credential: string): Promise<UserProfile> {
  try {
    const result = await apiFetch<{ accessToken: string; user: UserProfile }>("/auth/google/login", {
      method: "POST",
      body: JSON.stringify({ credential })
    });
    
    setStoredAccessToken(result.accessToken);
    localStorage.setItem("magro_user_name", result.user.name);
    
    return result.user;
  } catch (err: any) {
    throw err;
  }
}

/**
 * Traite la réponse du popup Google pour l'INSCRIPTION et renvoie un UserProfile.
 */
export async function handleGoogleSignup(credential: string, role?: string, phone?: string): Promise<UserProfile> {
  try {
    const result = await apiFetch<{ accessToken: string; user: UserProfile }>("/auth/google/signup", {
      method: "POST",
      body: JSON.stringify({ credential, role: role ? role.toUpperCase() : undefined, phone })
    });
    
    setStoredAccessToken(result.accessToken);
    localStorage.setItem("magro_user_name", result.user.name);
    
    return result.user;
  } catch (err: any) {
    throw err;
  }
}

/**
 * Obtenir le Google Client ID depuis les variables d'environnement
 */
export function getGoogleClientId(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID_HERE") {
    console.warn("⚠️ VITE_GOOGLE_CLIENT_ID non configuré dans .env, utilisation d'un fallback pour l'affichage");
    return "987571438907-83nojnou0ks6qsc5dopu0rf5d4prf7bu.apps.googleusercontent.com";
  }
  return clientId;
}
