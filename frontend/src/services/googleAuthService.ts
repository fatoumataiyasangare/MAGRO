/**
 * Service d'authentification Google avec mode développement simulé
 * 
 * Ce service permet de basculer automatiquement entre:
 * - Authentification Google OAuth réelle
 * - Mode développement simulé (utilisateur fictif)
 * 
 * Pour brancher Google OAuth réel:
 * 1. Configurez les variables d'environnement GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET
 * 2. Activez GOOGLE_AUTH_ENABLED=true
 * 3. Configurez l'application Google Console avec les redirect URIs appropriés
 * 4. Implémentez les méthodes signIn et signOut dans RealGoogleAuthService
 */

import { shouldUseRealApi, logApiIntegrationPoint } from "./config";
import type { UserProfile } from "./auth";

export interface GoogleAuthService {
  signIn(): Promise<UserProfile>;
  signOut(): Promise<void>;
}

/**
 * Profil utilisateur fictif pour le mode développement
 */
const MOCK_USER: UserProfile = {
  id: "mock-google-user-123",
  phone: "+22370123456",
  name: "Utilisateur Google Test",
  role: "BUYER"
};

/**
 * Implémentation réelle de l'authentification Google OAuth
 * 
 * Pour configurer Google OAuth:
 * 1. Créez un projet sur https://console.cloud.google.com
 * 2. Activez Google+ API ou Google Identity Platform
 * 3. Créez des credentials OAuth 2.0
 * 4. Configurez les redirect URIs autorisées
 * 5. Configurez les variables d'environnement
 */
class RealGoogleAuthService implements GoogleAuthService {
  async signIn(): Promise<UserProfile> {
    const cfg = import.meta.env;
    const clientId = cfg.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      throw new Error("Google OAuth credentials not configured");
    }

    // TODO: Implémenter l'authentification Google OAuth réelle
    // Exemple avec Google Identity Services:
    /*
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'profile email',
      callback: async (response) => {
        const userInfo = await fetchGoogleUserInfo(response.access_token);
        return this.mapGoogleUserToProfile(userInfo);
      },
    });
    
    tokenClient.requestAccessToken();
    */

    throw new Error("Real Google OAuth not yet implemented. Please configure Google OAuth credentials.");
  }

  async signOut(): Promise<void> {
    // TODO: Implémenter la déconnexion Google OAuth réelle
    /*
    google.accounts.oauth2.revoke(clientId);
    */
  }

  private async fetchGoogleUserInfo(accessToken: string): Promise<any> {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.json();
  }

  private mapGoogleUserToProfile(googleUser: any): UserProfile {
    return {
      id: googleUser.sub,
      phone: googleUser.phone_number || "+22370123456", // Google ne fournit pas toujours le numéro
      name: googleUser.name,
      role: "BUYER" // Par défaut, l'utilisateur peut changer son rôle plus tard
    };
  }
}

/**
 * Implémentation simulée de l'authentification Google pour le développement
 * Crée un utilisateur fictif pour tester le parcours utilisateur
 */
class MockGoogleAuthService implements GoogleAuthService {
  async signIn(): Promise<UserProfile> {
    console.log("=".repeat(60));
    console.log("🔐 GOOGLE AUTH SIMULÉ - Mode Développement");
    console.log("=".repeat(60));
    console.log(`👤 Utilisateur: ${MOCK_USER.name}`);
    console.log(`📞 Téléphone: ${MOCK_USER.phone}`);
    console.log(`🎭 Rôle: ${MOCK_USER.role}`);
    console.log("=".repeat(60));
    console.log("⚠️  En production, l'authentification Google OAuth réelle sera utilisée");
    console.log("=".repeat(60));
    
    // Simuler un délai d'authentification
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return MOCK_USER;
  }

  async signOut(): Promise<void> {
    console.log("🔓 Déconnexion Google simulée");
  }
}

/**
 * Factory pour obtenir le service Google Auth approprié
 * Bascule automatiquement entre API réelle et mode simulé
 */
function getGoogleAuthService(): GoogleAuthService {
  const useRealApi = shouldUseRealApi("google");
  
  logApiIntegrationPoint(
    "Google Auth Service",
    useRealApi 
      ? "Utilisation de Google OAuth réel. Configurez VITE_GOOGLE_CLIENT_ID dans .env"
      : "Utilisation du mode simulé. Un utilisateur fictif sera créé."
  );

  if (useRealApi) {
    return new RealGoogleAuthService();
  }
  
  return new MockGoogleAuthService();
}

// Instance singleton du service Google Auth
let googleAuthServiceInstance: GoogleAuthService | null = null;

/**
 * Connecte l'utilisateur avec Google
 * @returns Profil utilisateur
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  if (!googleAuthServiceInstance) {
    googleAuthServiceInstance = getGoogleAuthService();
  }
  
  return googleAuthServiceInstance.signIn();
}

/**
 * Déconnecte l'utilisateur Google
 */
export async function signOutGoogle(): Promise<void> {
  if (!googleAuthServiceInstance) {
    googleAuthServiceInstance = getGoogleAuthService();
  }
  
  return googleAuthServiceInstance.signOut();
}

/**
 * Réinitialise le service Google Auth (utile pour les tests)
 */
export function resetGoogleAuthService(): void {
  googleAuthServiceInstance = null;
}
