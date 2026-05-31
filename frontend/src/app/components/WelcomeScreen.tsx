import { motion } from "motion/react";
import logoMagro from "../../imports/MAGRO.png";

interface WelcomeScreenProps {
  onSignup: () => void;
  onLogin: () => void;
}

export default function WelcomeScreen({ onSignup, onLogin }: WelcomeScreenProps) {
  return (
    <div className="h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={logoMagro}
            alt="MAGRO"
            className="w-64 max-w-full mx-auto mb-12"
            style={{ mixBlendMode: 'multiply' }}
          />

          <div className="mb-12">
            <svg className="w-full h-48 mb-8" viewBox="0 0 300 200">
              <circle cx="80" cy="100" r="30" fill="#E8F5E9" />
              <text x="80" y="110" textAnchor="middle" fontSize="30">🌾</text>

              <circle cx="220" cy="100" r="30" fill="#FFF3E0" />
              <text x="220" y="110" textAnchor="middle" fontSize="30">🛒</text>

              <line x1="110" y1="100" x2="190" y2="100" stroke="#2E7D32" strokeWidth="3" strokeDasharray="5,5" />

              <circle cx="150" cy="100" r="20" fill="#F57C00" />
              <text x="150" y="108" textAnchor="middle" fontSize="24">📱</text>
            </svg>

            <h1 className="text-2xl mb-3">Bienvenue sur MAGRO</h1>
            <p className="text-muted-foreground px-4">
              La plateforme qui connecte producteurs et acheteurs au Mali
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={onSignup}
              className="w-full bg-secondary hover:bg-secondary/90 text-white py-4 rounded-xl transition-colors"
            >
              Je m'inscris
            </button>

            <button
              onClick={onLogin}
              className="w-full bg-white border-2 border-primary text-primary hover:bg-primary/5 py-4 rounded-xl transition-colors"
            >
              J'ai déjà un compte
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
