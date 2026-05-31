import { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import logoMagro from "../../imports/MAGRO.png";

interface SignupOTPScreenProps {
  phoneNumber: string;
  onVerify: () => void;
  onBack: () => void;
}

export default function SignupOTPScreen({ phoneNumber, onVerify, onBack }: SignupOTPScreenProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const inputs = document.querySelectorAll<HTMLInputElement>('.otp-input');
      inputs[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const inputs = document.querySelectorAll<HTMLInputElement>('.otp-input');
      inputs[index - 1]?.focus();
    }
  };

  const isComplete = otp.every(digit => digit !== "");

  return (
    <div className="h-screen bg-muted flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </button>

          <div className="text-center mb-12">
            <img
              src={logoMagro}
              alt="MAGRO"
              className="w-48 max-w-full mx-auto mb-6"
              style={{ mixBlendMode: 'multiply' }}
            />
            <h2 className="text-xl mb-2">Vérification</h2>
            <p className="text-muted-foreground text-sm mb-1">
              Code envoyé par SMS au
            </p>
            <p className="text-foreground">{phoneNumber}</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm mb-4 text-foreground text-center">
                Entrez le code de vérification
              </label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="otp-input w-12 h-14 text-center text-2xl bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ))}
              </div>
            </div>

            <button
              onClick={onVerify}
              disabled={!isComplete}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Vérifier</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Vous n'avez pas reçu le code ?
              </p>
              <button className="text-primary text-sm underline">
                Renvoyer le code
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
