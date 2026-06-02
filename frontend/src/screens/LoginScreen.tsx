import React, { useState } from "react";
import { Phone, ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { GoogleLogin } from "@react-oauth/google";
import logoMagro from "../assets/MAGRO.png";
import { requestOtp, verifyOtp } from "../services/auth";
import { handleGoogleCredential } from "../services/googleAuthService";
import { validateMalianPhone } from "../services/phoneValidation";

interface LoginScreenProps {
  onComplete: () => void;
  onBack: () => void;
  onNavigateToSignup?: () => void;
}

export default function LoginScreen({ onComplete, onBack, onNavigateToSignup }: LoginScreenProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Gérer le compte à rebours
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handlePhoneContinue = async () => {
    setErrorMessage("");
    const validation = validateMalianPhone(phoneNumber);
    if (!validation.isValid) {
      setErrorMessage(validation.error || "Veuillez saisir un numéro de téléphone malien valide.");
      return;
    }
    const formattedPhone = validation.formattedPhone || phoneNumber;
    setPhoneNumber(formattedPhone);
    setIsLoading(true);
    try {
      await requestOtp(formattedPhone);
      setStep("otp");
      setCountdown(60);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Impossible d'envoyer le code OTP. Vérifiez que le backend est lancé.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = async (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const inputs = document.querySelectorAll<HTMLInputElement>(".otp-input");
      inputs[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      setErrorMessage("");
      setIsLoading(true);
      try {
        await verifyOtp(phoneNumber, newOtp.join(""));
        setTimeout(onComplete, 500);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Code de vérification invalide");
        // Reset OTP fields on error
        setOtp(["", "", "", "", "", ""]);
        const inputs = document.querySelectorAll<HTMLInputElement>(".otp-input");
        inputs[0]?.focus();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const inputs = document.querySelectorAll<HTMLInputElement>(".otp-input");
      inputs[index - 1]?.focus();
    }
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        handleGoogleCredential(credentialResponse.credential);
        setTimeout(onComplete, 500);
      } catch (error) {
        setErrorMessage("Erreur lors de l'authentification Google.");
      }
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="my-auto">

          {/* Back button */}
          <button
            onClick={step === "otp" ? () => setStep("phone") : onBack}
            className="mb-6 p-2 hover:bg-gray-100 rounded-xl transition-colors active:scale-95 inline-flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <img
            src={logoMagro}
            alt="MAGRO"
            className="w-40 mx-auto mb-8"
            style={{ mixBlendMode: "multiply" }}
          />

          {step === "phone" ? (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">Connexion</h1>
                <p className="text-muted-foreground text-sm">Entrez votre numéro pour vous connecter</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Numéro de téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+223 XX XX XX XX"
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-border rounded-xl focus:outline-none focus:border-primary text-lg"
                    onKeyDown={(e) => { if (e.key === "Enter" && phoneNumber.length >= 8) handlePhoneContinue(); }}
                  />
                </div>
              </div>

              <button
                onClick={handlePhoneContinue}
                disabled={phoneNumber.length < 8 || isLoading}
                className="w-full bg-secondary hover:bg-secondary/90 active:scale-[0.98] text-white py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold cursor-pointer"
              >
                {isLoading ? "Envoi en cours..." : "Recevoir le code"}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>

              {errorMessage && (
                <div className="text-center">
                  <p className="text-sm text-destructive">{errorMessage}</p>
                  {errorMessage.includes("inscrivez-vous") && onNavigateToSignup && (
                    <button 
                      onClick={onNavigateToSignup}
                      className="mt-2 text-sm text-primary font-semibold underline cursor-pointer"
                    >
                      Aller à la page d'inscription
                    </button>
                  )}
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-muted-foreground">OU</span>
                </div>
              </div>

              {/* Vrai bouton Google OAuth — affiche le popup de sélection de compte */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setErrorMessage("Échec de la connexion Google. Réessayez.")}
                  theme="outline"
                  size="large"
                  width="350"
                  text="continue_with"
                  shape="pill"
                  locale="fr"
                />
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Code de vérification</h2>
                <p className="text-muted-foreground text-sm">Code envoyé au {phoneNumber}</p>
              </div>

              <div className="flex justify-center gap-2 mb-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="otp-input w-12 h-14 text-center text-2xl font-bold bg-white border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                  />
                ))}
              </div>

              {errorMessage && <p className="text-sm text-destructive text-center mb-4">{errorMessage}</p>}

              <div className="text-center mb-6">
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Renvoyer le code dans <span className="font-bold text-gray-900">{countdown}s</span>
                  </p>
                ) : (
                  <button 
                    onClick={() => { setCountdown(60); requestOtp(phoneNumber); }}
                    className="text-secondary text-sm font-semibold hover:underline cursor-pointer"
                  >
                    Renvoyer le code
                  </button>
                )}
              </div>

              <button onClick={() => setStep("phone")} className="text-primary text-sm mx-auto block hover:underline cursor-pointer">
                Modifier le numéro
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
