/**
 * Service de validation des numéros de téléphone maliens
 * 
 * Format valide:
 * - Avec indicatif: +223 XX XX XX XX ou 223 XX XX XX XX
 * - Sans indicatif: XX XX XX XX (8 chiffres)
 * 
 * Préfixes maliens valides: 20-79 (mobiles)
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  formattedPhone?: string;
}

/**
 * Nettoie un numéro de téléphone (supprime espaces, tirets, parenthèses)
 */
function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, "");
}

/**
 * Formate un numéro de téléphone malien au format international
 */
function formatMalianPhone(phone: string): string {
  const cleaned = cleanPhoneNumber(phone);
  
  // Si commence déjà par +223 ou 223
  if (cleaned.startsWith("+223")) {
    return cleaned;
  }
  if (cleaned.startsWith("223") && cleaned.length === 11) {
    return "+" + cleaned;
  }
  
  // Sinon, ajouter l'indicatif
  return "+223" + cleaned;
}

/**
 * Valide si un préfixe est un préfixe mobile malien valide
 * Les préfixes mobiles maliens sont: 20-79
 */
function isValidMalianPrefix(prefix: string): boolean {
  const prefixNum = parseInt(prefix, 10);
  return prefixNum >= 20 && prefixNum <= 79;
}

/**
 * Valide un numéro de téléphone malien
 * @param phone Numéro de téléphone à valider
 * @returns ValidationResult avec isValid, error et formattedPhone
 */
export function validateMalianPhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === "") {
    return {
      isValid: false,
      error: "Veuillez saisir un numéro de téléphone"
    };
  }

  const cleaned = cleanPhoneNumber(phone);
  
  // Cas 1: Avec indicatif +223 (format international)
  if (cleaned.startsWith("+223")) {
    const localNumber = cleaned.substring(4); // Après +223
    
    // Vérifier la longueur (8 chiffres après l'indicatif)
    if (localNumber.length !== 8) {
      return {
        isValid: false,
        error: "Veuillez saisir un numéro de téléphone malien valide (8 chiffres après l'indicatif)"
      };
    }
    
    // Vérifier que ce sont des chiffres
    if (!/^\d+$/.test(localNumber)) {
      return {
        isValid: false,
        error: "Le numéro ne doit contenir que des chiffres"
      };
    }
    
    // Vérifier le préfixe (2 premiers chiffres)
    const prefix = localNumber.substring(0, 2);
    if (!isValidMalianPrefix(prefix)) {
      return {
        isValid: false,
        error: "Veuillez saisir un numéro de téléphone mobile malien valide"
      };
    }
    
    return {
      isValid: true,
      formattedPhone: cleaned
    };
  }
  
  // Cas 2: Avec indicatif 223 sans le +
  if (cleaned.startsWith("223")) {
    const localNumber = cleaned.substring(3); // Après 223
    
    // Vérifier la longueur totale (11 chiffres: 223 + 8)
    if (cleaned.length !== 11) {
      return {
        isValid: false,
        error: "Veuillez saisir un numéro de téléphone malien valide (11 chiffres avec l'indicatif)"
      };
    }
    
    // Vérifier que ce sont des chiffres
    if (!/^\d+$/.test(localNumber)) {
      return {
        isValid: false,
        error: "Le numéro ne doit contenir que des chiffres"
      };
    }
    
    // Vérifier le préfixe (2 premiers chiffres du numéro local)
    const prefix = localNumber.substring(0, 2);
    if (!isValidMalianPrefix(prefix)) {
      return {
        isValid: false,
        error: "Veuillez saisir un numéro de téléphone mobile malien valide"
      };
    }
    
    return {
      isValid: true,
      formattedPhone: "+" + cleaned
    };
  }
  
  // Cas 3: Sans indicatif (format local)
  if (cleaned.length === 8) {
    // Vérifier que ce sont des chiffres
    if (!/^\d+$/.test(cleaned)) {
      return {
        isValid: false,
        error: "Le numéro ne doit contenir que des chiffres"
      };
    }
    
    // Vérifier le préfixe (2 premiers chiffres)
    const prefix = cleaned.substring(0, 2);
    if (!isValidMalianPrefix(prefix)) {
      return {
        isValid: false,
        error: "Veuillez saisir un numéro de téléphone mobile malien valide"
      };
    }
    
    return {
      isValid: true,
      formattedPhone: "+223" + cleaned
    };
  }
  
  // Cas 4: Longueur invalide
  if (cleaned.length < 8) {
    return {
      isValid: false,
      error: "Le numéro est trop court (minimum 8 chiffres)"
    };
  }
  
  if (cleaned.length > 13) { // +223 + 8 chiffres = 12 caractères max
    return {
      isValid: false,
      error: "Le numéro est trop long"
    };
  }
  
  // Cas par défaut: format invalide
  return {
    isValid: false,
    error: "Veuillez saisir un numéro de téléphone malien valide"
  };
}

/**
 * Valide et formate un numéro de téléphone en une seule étape
 */
export function validateAndFormatPhone(phone: string): ValidationResult {
  const validation = validateMalianPhone(phone);
  
  if (validation.isValid && !validation.formattedPhone) {
    validation.formattedPhone = formatMalianPhone(phone);
  }
  
  return validation;
}
