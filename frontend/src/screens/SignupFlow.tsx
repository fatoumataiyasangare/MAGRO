import React, { useState } from "react";
import { Phone, ArrowRight, ArrowLeft, User, Sprout, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import logoMagro from "../assets/MAGRO.png";
import { requestOtp, verifyOtp } from "../services/auth";
import { signInWithGoogle } from "../services/googleAuthService";
import { validateMalianPhone } from "../services/phoneValidation";

interface SignupFlowProps {
  onComplete: (role: "buyer" | "farmer") => void;
  onBack: () => void;
}

type SignupStep = "role" | "info" | "otp";

export default function SignupFlow({ onComplete, onBack }: SignupFlowProps) {
  const [step, setStep] = useState<SignupStep>("role");
  const [selectedRole, setSelectedRole] = useState<"buyer" | "farmer" | null>(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Gérer le compte à rebours
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRoleSelect = (role: "buyer" | "farmer") => {
    setSelectedRole(role);
    setStep("info");
  };

  const handleInfoContinue = async () => {
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Veuillez entrer votre nom complet.");
      return;
    }

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
      setCountdown(60); // 60 secondes
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Impossible d'envoyer le code OTP");
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
      const inputs = document.querySelectorAll<HTMLInputElement>(".otp-input-signup");
      inputs[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      setErrorMessage("");
      setIsLoading(true);
      try {
        await verifyOtp(phoneNumber, newOtp.join(""));
        // Store the name in localStorage for profile
        localStorage.setItem("magro_user_name", fullName);
        setTimeout(() => onComplete(selectedRole!), 500);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Code de vérification invalide");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const inputs = document.querySelectorAll<HTMLInputElement>(".otp-input-signup");
      inputs[index - 1]?.focus();
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      await signInWithGoogle();
      localStorage.setItem("magro_user_name", fullName || "Utilisateur Google");
      setTimeout(() => onComplete(selectedRole!), 500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erreur lors de la connexion Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepBack = () => {
    if (step === "otp") setStep("info");
    else if (step === "info") setStep("role");
    else onBack();
  };

  // Step indicator
  const stepNumber = step === "role" ? 1 : step === "info" ? 2 : 3;

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="my-auto">

          {/* Back + Step indicator */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleStepBack}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors active:scale-95 inline-flex items-center gap-2 text-sm text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s <= stepNumber ? "bg-secondary w-8" : "bg-gray-200 w-4"
                  }`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Role Selection */}
            {step === "role" && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-bold mb-2">Créer un compte</h1>
                  <p className="text-muted-foreground text-sm">Quel est votre profil ?</p>
                </div>

                <div className="space-y-4">
                  {/* Acheteur */}
                  <button
                    onClick={() => handleRoleSelect("buyer")}
                    className="w-full bg-white border-2 border-gray-200 hover:border-secondary hover:bg-secondary/5 active:scale-[0.98] rounded-2xl p-6 text-left transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                        <ShoppingBag className="w-7 h-7 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Acheteur</h3>
                        <p className="text-sm text-muted-foreground">
                          Je veux acheter des produits agricoles
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
                    </div>
                  </button>

                  {/* Agriculteur */}
                  <button
                    onClick={() => handleRoleSelect("farmer")}
                    className="w-full bg-white border-2 border-gray-200 hover:border-primary hover:bg-primary/5 active:scale-[0.98] rounded-2xl p-6 text-left transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Sprout className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Agriculteur</h3>
                        <p className="text-sm text-muted-foreground">
                          Je veux vendre ma production agricole
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Personal Info */}
            {step === "info" && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-bold mb-2">Vos informations</h1>
                  <p className="text-muted-foreground text-sm">
                    {selectedRole === "buyer" ? "Compte Acheteur" : "Compte Agriculteur"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Amadou Traoré"
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-border rounded-xl focus:outline-none focus:border-primary text-lg"
                    />
                  </div>
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
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-4">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-secondary focus:ring-secondary cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                    J'accepte les{" "}
                    <a href="/terms" target="_blank" className="text-secondary hover:underline">
                      Conditions d'utilisation
                    </a>{" "}
                    et la{" "}
                    <a href="/privacy" target="_blank" className="text-secondary hover:underline">
                      Politique de confidentialité
                    </a>
                  </label>
                </div>

                <button
                  onClick={handleInfoContinue}
                  disabled={!fullName.trim() || phoneNumber.length < 8 || !termsAccepted || isLoading}
                  className="w-full bg-secondary hover:bg-secondary/90 active:scale-[0.98] text-white py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                >
                  {isLoading ? "Envoi en cours..." : "Recevoir le code de vérification"}
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>

                {errorMessage && <p className="text-sm text-destructive text-center">{errorMessage}</p>}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-muted-foreground">OU</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || !selectedRole}
                  className="w-full bg-white border-2 border-border hover:bg-muted/50 active:scale-[0.98] py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>S'inscrire avec Google</span>
                </button>
              </motion.div>
            )}

            {/* STEP 3: OTP Verification */}
            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
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
                      className="otp-input-signup w-12 h-14 text-center text-2xl font-bold bg-white border-2 border-border rounded-xl focus:outline-none focus:border-primary"
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
                      className="text-secondary text-sm font-semibold hover:underline"
                    >
                      Renvoyer le code
                    </button>
                  )}
                </div>

                <button onClick={() => setStep("info")} className="text-primary text-sm mx-auto block hover:underline">
                  Modifier le numéro
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
