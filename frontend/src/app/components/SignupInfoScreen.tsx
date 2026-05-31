import { useState } from "react";
import { User, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import logoMagro from "../../imports/MAGRO.png";

interface SignupInfoScreenProps {
  onContinue: (name: string) => void;
}

export default function SignupInfoScreen({ onContinue }: SignupInfoScreenProps) {
  const [fullName, setFullName] = useState("");

  const handleContinue = () => {
    if (fullName.trim().length >= 3) {
      onContinue(fullName);
    }
  };

  return (
    <div className="h-screen bg-muted flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <img
              src={logoMagro}
              alt="MAGRO"
              className="w-48 max-w-full mx-auto mb-6"
              style={{ mixBlendMode: 'multiply' }}
            />
            <h2 className="text-xl mb-2">Bienvenue sur MAGRO</h2>
            <p className="text-muted-foreground text-sm">
              Dites-nous comment vous appeler
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm mb-2 text-foreground">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Votre nom complet"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Ce nom sera visible par les autres utilisateurs
              </p>
            </div>

            <button
              onClick={handleContinue}
              disabled={fullName.trim().length < 3}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continuer</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
