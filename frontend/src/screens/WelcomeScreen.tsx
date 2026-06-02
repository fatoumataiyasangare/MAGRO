import { motion } from "motion/react";
import { LogIn, UserPlus } from "lucide-react";
import logoMagro from "../assets/MAGRO.png";

interface WelcomeScreenProps {
  onLogin: () => void;
  onSignup: () => void;
  onTerms: () => void;
}

export default function WelcomeScreen({ onLogin, onSignup, onTerms }: WelcomeScreenProps) {
  return (
    <div className="h-screen bg-gradient-to-b from-primary/5 via-white to-secondary/5 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 max-w-md mx-auto w-full">
        {/* Logo + Tagline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <img
            src={logoMagro}
            alt="MAGRO"
            className="w-48 mx-auto mb-6"
            style={{ mixBlendMode: "multiply" }}
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto"
          >
            La marketplace agricole qui connecte producteurs et acheteurs au Mali
          </motion.p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full space-y-4"
        >
          {/* Se Connecter */}
          <button
            onClick={onLogin}
            className="w-full bg-secondary hover:bg-secondary/90 active:scale-[0.98] text-white py-4 rounded-2xl transition-all font-semibold text-base flex items-center justify-center gap-3 shadow-lg shadow-secondary/20"
          >
            <LogIn className="w-5 h-5" />
            Se connecter
          </button>

          {/* S'inscrire */}
          <button
            onClick={onSignup}
            className="w-full bg-white hover:bg-gray-50 active:scale-[0.98] text-gray-900 py-4 rounded-2xl transition-all font-semibold text-base flex items-center justify-center gap-3 border-2 border-gray-200 shadow-sm"
          >
            <UserPlus className="w-5 h-5" />
            Créer un compte
          </button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-muted-foreground text-center mt-10"
        >
          En continuant, vous acceptez nos{" "}
          <button onClick={onTerms} className="text-primary font-medium hover:underline">
            Conditions d'utilisation
          </button>
        </motion.p>
      </div>
    </div>
  );
}
