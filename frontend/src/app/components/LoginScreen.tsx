import { useState } from "react";
import { Phone, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import logoMagro from "../../imports/MAGRO.png";

interface LoginScreenProps {
  onLogin: () => void;
  onSignupClick?: () => void;
}

export default function LoginScreen({ onLogin, onSignupClick }: LoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");

  const handleContinue = () => {
    if (!showOTP) {
      setShowOTP(true);
    } else {
      onLogin();
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
              className="w-64 max-w-full mx-auto mb-4"
              style={{ mixBlendMode: 'multiply' }}
            />
            <p className="text-muted-foreground">Connectez-vous pour continuer</p>
          </div>

          <div className="space-y-6">
            {!showOTP ? (
              <>
                <div>
                  <label className="block text-sm mb-2 text-foreground">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+223 XX XX XX XX"
                      className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  disabled={phoneNumber.length < 8}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Continuer</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-muted text-muted-foreground">OU</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full bg-white border border-border hover:bg-muted/50 py-4 rounded-xl flex items-center justify-center gap-3 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-foreground">Continuer avec Google</span>
                  </button>

                  <button className="w-full bg-[#1877F2] hover:bg-[#1877F2]/90 text-white py-4 rounded-xl flex items-center justify-center gap-3 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Continuer avec Facebook</span>
                  </button>

                  <button className="w-full bg-white border border-border hover:bg-muted/50 py-4 rounded-xl flex items-center justify-center gap-3 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
                    </svg>
                    <span className="text-foreground">Continuer avec GitHub</span>
                  </button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  En continuant, vous acceptez nos{" "}
                  <button className="text-primary underline">Conditions d'utilisation</button>
                  {" "}et notre{" "}
                  <button className="text-primary underline">Politique de confidentialité</button>
                </p>

                {onSignupClick && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground">
                      Vous n'avez pas de compte ?{" "}
                      <button onClick={onSignupClick} className="text-primary">
                        Créer un compte
                      </button>
                    </p>
                  </div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <label className="block text-sm mb-2 text-foreground">
                  Code de vérification
                </label>
                <p className="text-sm text-muted-foreground mb-4">
                  Entrez le code envoyé au {phoneNumber}
                </p>
                <div className="flex gap-3 justify-center mb-6">
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      className="w-14 h-14 text-center text-2xl bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      onChange={(e) => {
                        const newOtp = otp.split("");
                        newOtp[i] = e.target.value;
                        setOtp(newOtp.join(""));
                        if (e.target.value && i < 3) {
                          const next = e.target.parentElement?.children[i + 1] as HTMLInputElement;
                          next?.focus();
                        }
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={handleContinue}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-4 rounded-xl flex items-center justify-center gap-2 transition-colors mb-4"
                >
                  <span>Vérifier</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="text-center space-y-2">
                  <button
                    onClick={() => setShowOTP(false)}
                    className="text-primary text-sm"
                  >
                    Modifier le numéro
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Vous n'avez pas reçu le code ?{" "}
                    <button className="text-primary underline">Renvoyer</button>
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
