/**
 * Service d'authentification Google utilisant @react-oauth/google
 * 
 * Ce service gère l'authentification via le popup Google réel.
 * Le Google Client ID est configuré dans .env (VITE_GOOGLE_CLIENT_ID).
 * 
 * Flux:
 * 1. L'utilisateur clique sur "Continuer avec Google"
 * 2. Le popup Google natif s'affiche (sélection de compte)
 * 3. Google renvoie un credential (JWT id_token)
 * 4. Le frontend decode le JWT pour extraire le profil
 * 5. Le profil est stocké localement et l'utilisateur est connecté
 * 
 * En production, le credential devrait être envoyé au backend
 * pour validation côté serveur via l'API Google.
 */

import { jwtDecode } from "jwt-decode";
import type { UserProfile } from "./auth";

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
 * Traite la réponse du popup Google et renvoie un UserProfile.
 * Cette fonction est appelée par le composant GoogleLogin onSuccess.
 */
export function handleGoogleCredential(credential: string): UserProfile {
  const decoded = decodeGoogleCredential(credential);
  
  const profile: UserProfile = {
    id: `google-${decoded.sub}`,
    phone: "+22370000000", // Google ne fournit pas de numéro de téléphone
    name: decoded.name,
    role: "BUYER" // Rôle par défaut, l'utilisateur peut changer ensuite
  };

  // Stocker la session
  localStorage.setItem("magro_mock_session", JSON.stringify(profile));
  localStorage.setItem("magro_user_name", decoded.name);
  
  console.log("✅ Authentification Google réussie:", decoded.name, decoded.email);
  
  return profile;
}

/**
 * Obtenir le Google Client ID depuis les variables d'environnement
 */
export function getGoogleClientId(): string | null {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID_HERE") {
    console.warn("⚠️ VITE_GOOGLE_CLIENT_ID non configuré dans .env");
    return null;
  }
  return clientId;
}
