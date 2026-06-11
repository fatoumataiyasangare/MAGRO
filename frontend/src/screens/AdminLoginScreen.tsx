import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, ArrowRight, Lock, UserCog } from "lucide-react";
import { useToast } from "../components/ToastProvider";
import { requestOtp, verifyOtp } from "../services/auth";
import { validateMalianPhone } from "../services/phoneValidation";

interface AdminLoginScreenProps {
  onLoginComplete: (role: "MODERATOR" | "SUPER_ADMIN" | "ANALYST") => void;
}

export default function AdminLoginScreen({ onLoginComplete }: AdminLoginScreenProps) {
  const { showToast } = useToast();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateMalianPhone(phone);
    if (!validation.isValid) {
      showToast(validation.error || "Numéro de téléphone invalide.", "error");
      return;
    }
    const formattedPhone = validation.formattedPhone || phone;
    setPhone(formattedPhone);

    setIsLoading(true);
    try {
      await requestOtp(formattedPhone);
      setStep("otp");
      showToast("Code de vérification envoyé.", "success");
    } catch (err: any) {
      showToast(err.message || "Erreur de connexion.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      showToast("Le code doit contenir 6 chiffres.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await verifyOtp(phone, otp);
      
      // Strict Role Check for Admin Portal
      if (user.role === "SUPER_ADMIN" || user.role === "MODERATOR" || user.role === "ANALYST") {
        showToast(`Bienvenue, ${user.name}`, "success");
        onLoginComplete(user.role as any);
      } else {
        // Not an admin: Wipe token so they aren't accidentally logged in
        await fetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {});
        // Also wipe memory token if accessible, but it's okay, next reload clears it
        
        showToast("Accès refusé. Espace réservé au personnel administratif.", "error");
        setStep("phone");
        setPhone("");
        setOtp("");
      }
    } catch (err: any) {
      showToast(err.message || "Code invalide.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="z-10 w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">MAGRO Secure</h1>
          <p className="text-gray-400 text-sm mt-1">Portail d'Administration</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "phone" ? (
            <motion.form
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleRequestOtp}
              className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                  Identifiant (Numéro)
                </label>
                <div className="relative">
                  <UserCog className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+223..."
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? "Vérification..." : "Continuer"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyOtp}
              className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                  Code de Sécurité
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="••••••"
                    maxLength={6}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all tracking-widest font-mono"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? "Authentification..." : "S'authentifier"}
              </button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-xs text-gray-400 hover:text-white pt-2 transition-colors"
              >
                Retour
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center text-[10px] text-gray-500 uppercase tracking-widest">
          Accès restreint aux employés
        </div>
      </div>
    </div>
  );
}
