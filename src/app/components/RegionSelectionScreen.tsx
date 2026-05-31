import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import logoMagro from "../../imports/MAGRO.png";

interface RegionSelectionScreenProps {
  onContinue: (region: string) => void;
}

const regions = [
  "Kayes",
  "Koulikoro",
  "Sikasso",
  "Ségou",
  "Mopti",
  "Tombouctou",
  "Gao",
  "Kidal",
  "District de Bamako"
];

export default function RegionSelectionScreen({ onContinue }: RegionSelectionScreenProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  return (
    <div className="h-screen bg-muted flex flex-col">
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col"
        >
          <div className="text-center mb-8">
            <div className="text-sm text-muted-foreground mb-4">Étape 5/5</div>
            <img
              src={logoMagro}
              alt="MAGRO"
              className="w-40 max-w-full mx-auto mb-4"
              style={{ mixBlendMode: 'multiply' }}
            />
            <h2 className="text-xl mb-2">Votre région au Mali</h2>
          </div>

          <div className="flex-1 overflow-y-auto mb-6">
            <div className="grid grid-cols-2 gap-3">
              {regions.map((region, index) => (
                <motion.button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`py-4 px-3 rounded-xl text-sm transition-all ${
                    selectedRegion === region
                      ? "bg-primary text-white"
                      : "bg-white border border-border hover:border-primary"
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {region}
                </motion.button>
              ))}
            </div>
          </div>

          <button
            onClick={() => selectedRegion && onContinue(selectedRegion)}
            disabled={!selectedRegion}
            className="w-full bg-secondary hover:bg-secondary/90 text-white py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Terminer l'inscription</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
