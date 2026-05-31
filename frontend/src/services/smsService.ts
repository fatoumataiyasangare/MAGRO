/**
 * Service SMS abstrait avec mode développement simulé
 * 
 * Ce service permet de basculer automatiquement entre:
 * - API SMS réelle (Twilio, Africa's Talking, etc.)
 * - Mode développement simulé (OTP affiché dans la console)
 * 
 * Pour brancher une API SMS réelle:
 * 1. Configurez les variables d'environnement SMS_API_KEY et SMS_API_URL
 * 2. Activez SMS_API_ENABLED=true
 * 3. Implémentez la méthode sendOtp dans RealSMSService
 */

import { shouldUseRealApi, logApiIntegrationPoint } from "./config";

export interface SMSService {
  sendOtp(phone: string, code: string): Promise<void>;
  verifyOtp(phone: string, code: string): Promise<boolean>;
}

/**
 * Implémentation réelle du service SMS (à configurer avec un fournisseur)
 * 
 * Fournisseurs SMS supportés:
 * - Twilio: https://www.twilio.com
 * - Africa's Talking: https://www.africastalking.com
 * - Orange SMS: https://www.orange.com
 * - MTN SMS: https://www.mtn.com
 */
class RealSMSService implements SMSService {
  async sendOtp(phone: string, code: string): Promise<void> {
    const cfg = import.meta.env;
    const apiKey = cfg.VITE_SMS_API_KEY;
    const apiUrl = cfg.VITE_SMS_API_URL;
    
    if (!apiKey || !apiUrl) {
      throw new Error("SMS API credentials not configured");
    }

    // TODO: Implémenter l'appel API réel selon le fournisseur choisi
    // Exemple pour Twilio:
    /*
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        to: phone,
        from: cfg.VITE_SMS_SENDER_ID || "MAGRO",
        body: `Votre code de vérification MAGRO est: ${code}`
      })
    });
    
    if (!response.ok) {
      throw new Error("Failed to send SMS");
    }
    */

    throw new Error("Real SMS service not yet implemented. Please configure SMS API credentials.");
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    // La vérification OTP est gérée par le backend
    // Cette méthode est fournie pour compatibilité future
    return true;
  }
}

/**
 * Implémentation simulée du service SMS pour le développement
 * Affiche l'OTP dans la console pour faciliter les tests
 */
class MockSMSService implements SMSService {
  async sendOtp(phone: string, code: string): Promise<void> {
    console.log("=".repeat(60));
    console.log("📱 SMS SIMULÉ - Mode Développement");
    console.log("=".repeat(60));
    console.log(`📞 Numéro: ${phone}`);
    console.log(`🔐 Code OTP: ${code}`);
    console.log("=".repeat(60));
    console.log("⚠️  En production, ce code serait envoyé par SMS réel");
    console.log("=".repeat(60));
    
    // Simuler un délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    // En mode développement, accepte n'importe quel code de 6 chiffres
    return /^\d{6}$/.test(code);
  }
}

/**
 * Factory pour obtenir le service SMS approprié
 * Bascule automatiquement entre API réelle et mode simulé
 */
function getSMSService(): SMSService {
  const useRealApi = shouldUseRealApi("sms");
  
  logApiIntegrationPoint(
    "SMS Service",
    useRealApi 
      ? "Utilisation de l'API SMS réelle. Configurez VITE_SMS_API_KEY et VITE_SMS_API_URL dans .env"
      : "Utilisation du mode simulé. L'OTP sera affiché dans la console."
  );

  if (useRealApi) {
    return new RealSMSService();
  }
  
  return new MockSMSService();
}

// Instance singleton du service SMS
let smsServiceInstance: SMSService | null = null;

/**
 * Envoie un code OTP par SMS
 * @param phone Numéro de téléphone (format international)
 * @param code Code OTP à envoyer
 */
export async function sendOtp(phone: string, code: string): Promise<void> {
  if (!smsServiceInstance) {
    smsServiceInstance = getSMSService();
  }
  
  return smsServiceInstance.sendOtp(phone, code);
}

/**
 * Vérifie un code OTP
 * @param phone Numéro de téléphone
 * @param code Code OTP à vérifier
 */
export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  if (!smsServiceInstance) {
    smsServiceInstance = getSMSService();
  }
  
  return smsServiceInstance.verifyOtp(phone, code);
}

/**
 * Réinitialise le service SMS (utile pour les tests)
 */
export function resetSMSService(): void {
  smsServiceInstance = null;
}
