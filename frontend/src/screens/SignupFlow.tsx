import React, { useState } from "react";
import { Phone, ArrowRight, ArrowLeft, User, Sprout, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import logoMagro from "../assets/MAGRO.png";
import { requestOtp, verifyOtp, resendOtp } from "../services/auth";
import { GoogleLogin } from "@react-oauth/google";
import { handleGoogleSignup } from "../services/googleAuthService";
import { getGoogleClientId } from "../services/googleAuthService";
import { validateMalianPhone } from "../services/phoneValidation";
import { PolicyModal, type PolicyType } from "../components/PolicyModal";

interface SignupFlowProps {
  onComplete: (role: "buyer" | "farmer") => void;
  onBack: () => void;
  onNavigateToLogin?: () => void;
}

type SignupStep = "role" | "info" | "otp";

export default function SignupFlow({ onComplete, onBack, onNavigateToLogin }: SignupFlowProps) {
  const [step, setStep] = useState<SignupStep>("role");
  const [selectedRole, setSelectedRole] = useState<"buyer" | "farmer" | null>(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [buyerType, setBuyerType] = useState("individual");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [policyModal, setPolicyModal] = useState<PolicyType>(null);

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
      await requestOtp(formattedPhone, true);
      setStep("otp");
      setCountdown(60);
    } catch (error: any) {
      setErrorMessage(error instanceof Error ? error.message : "Erreur lors de l'envoi de l'OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = async (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    
    if (!numericValue) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    if (numericValue.length > 1) {
      // Handle paste
      for (let i = 0; i < numericValue.length && index + i < 6; i++) {
        newOtp[index + i] = numericValue[i];
      }
      setOtp(newOtp);
      const nextIndex = Math.min(index + numericValue.length, 5);
      const inputs = document.querySelectorAll<HTMLInputElement>(".otp-input-signup");
      inputs[nextIndex]?.focus();
    } else {
      // Handle single character typing
      newOtp[index] = numericValue;
      setOtp(newOtp);
      if (index < 5) {
        const inputs = document.querySelectorAll<HTMLInputElement>(".otp-input-signup");
        inputs[index + 1]?.focus();
      }
    }

    if (newOtp.every((digit) => digit !== "")) {
      setErrorMessage("");
      setIsLoading(true);
      try {
        await verifyOtp(phoneNumber, newOtp.join(""), fullName, selectedRole!);
        // Store the name in localStorage for profile
        localStorage.setItem("magro_user_name", fullName);
        if (selectedRole === "buyer") {
          localStorage.setItem("magro_buyer_subtype", buyerType);
        }
        // Clear OTP fields on success
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => onComplete(selectedRole!), 500);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Code de vérification invalide");
        // Reset OTP fields on error
        setOtp(["", "", "", "", "", ""]);
        const inputs = document.querySelectorAll<HTMLInputElement>(".otp-input-signup");
        inputs[0]?.focus();
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

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      setIsLoading(true);
      setErrorMessage("");
      try {
        // Envoi du credential, du rôle sélectionné et (optionnellement) du numéro s'il y est
        const userProfile = await handleGoogleSignup(credentialResponse.credential, selectedRole!, phoneNumber || undefined);
        localStorage.setItem("magro_user_name", userProfile.name || fullName || "Utilisateur Google");
        setTimeout(() => onComplete(selectedRole!), 500);
      } catch (error: any) {
        if (error.message) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Erreur lors de l'authentification Google.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };




  const googleClientId = getGoogleClientId();

  const handleStepBack = () => {
    if (step === "otp") setStep("info");
    else if (step === "info") setStep("role");
    else onBack();
  };

  // Step indicator
  const stepNumber = step === "role" ? 1 : step === "info" ? 2 : 3;

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto flex flex-col justify-start pt-4 px-6 pb-8 max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

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

                {selectedRole === "buyer" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Type d'acheteur</label>
                    <div className="relative">
                      <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <select
                        value={buyerType}
                        onChange={(e) => setBuyerType(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-border rounded-xl focus:outline-none focus:border-primary text-lg appearance-none"
                      >
                        <option value="individual">Particulier</option>
                        <option value="trader">Commerçant / Grossiste</option>
                        <option value="restaurant">Restaurateur / Hôtelier</option>
                        <option value="institution">Cantine / Institution</option>
                        <option value="industry">Industriel / Transformateur</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 mt-4">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-secondary focus:ring-secondary cursor-pointer flex-shrink-0"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                    J'accepte les{" "}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPolicyModal("terms"); }}
                      className="text-secondary font-medium hover:underline cursor-pointer"
                    >
                      Conditions d'utilisation
                    </button>
                    {" "}et la{" "}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPolicyModal("privacy"); }}
                      className="text-secondary font-medium hover:underline cursor-pointer"
                    >
                      Politique de confidentialité
                    </button>
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

                {errorMessage && (
                  <div className="text-sm text-destructive text-center">
                    {errorMessage.includes("Veuillez vous connecter") ? (
                      <p>
                        Un compte existe déjà avec ce numéro.{" "}
                        <button 
                          onClick={onNavigateToLogin || onBack} 
                          className="underline font-semibold hover:text-destructive/80 transition-colors cursor-pointer"
                        >
                          Veuillez vous connecter
                        </button>
                      </p>
                    ) : (
                      <p>{errorMessage}</p>
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

                {/* Google Auth */}
                <div className="flex justify-center">
                  {googleClientId && (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setErrorMessage("Échec de la connexion Google. Réessayez.")}
                      theme="outline"
                      size="large"
                      width="350"
                      text="signup_with"
                      shape="pill"
                      locale="fr"
                    />
                  )}
                </div>
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
                <div className="text-center mb-6">
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

                <button
                  onClick={async () => {
                    if (otp.some(d => d === "")) {
                      setErrorMessage("Veuillez saisir les 6 chiffres du code");
                      return;
                    }
                    setErrorMessage("");
                    setIsLoading(true);
                    try {
                      await verifyOtp(phoneNumber, otp.join(""), fullName, selectedRole!);
                      localStorage.setItem("magro_user_name", fullName);
                      if (selectedRole === "buyer") {
                        localStorage.setItem("magro_buyer_subtype", buyerType);
                      }
                      setOtp(["", "", "", "", "", ""]);
                      setTimeout(() => onComplete(selectedRole!), 500);
                    } catch (error) {
                      setErrorMessage(error instanceof Error ? error.message : "Code de vérification invalide");
                      setOtp(["", "", "", "", "", ""]);
                      const inputs = document.querySelectorAll<HTMLInputElement>(".otp-input-signup");
                      inputs[0]?.focus();
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg mb-6 shadow-[0_4px_14px_0_rgb(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isLoading ? "Validation..." : "Valider"}
                </button>

                <div className="text-center mb-6">
                  {countdown > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Renvoyer le code dans <span className="font-bold text-gray-900">{countdown}s</span>
                    </p>
                  ) : (
                    <button 
                      onClick={async () => {
                        setErrorMessage("");
                        setIsLoading(true);
                        try {
                          await resendOtp(phoneNumber);
                          setCountdown(60);
                          setOtp(["", "", "", "", "", ""]);
                          const inputs = document.querySelectorAll<HTMLInputElement>(".otp-input-signup");
                          inputs[0]?.focus();
                        } catch (error) {
                          setErrorMessage(error instanceof Error ? error.message : "Erreur lors du renvoi du code");
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading}
                      className="text-secondary text-sm font-semibold hover:underline disabled:opacity-50"
                    >
                      {isLoading ? "Envoi en cours..." : "Renvoyer le code"}
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

      {/* Policy Modal */}
      <PolicyModal type={policyModal} onClose={() => setPolicyModal(null)} />
    </div>
  );
}
