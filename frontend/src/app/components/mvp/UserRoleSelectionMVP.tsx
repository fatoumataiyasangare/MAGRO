import { ShoppingBag, Sprout, Monitor } from "lucide-react";
import { motion } from "motion/react";
import logoMagro from "../../../imports/MAGRO.png";

interface UserRoleSelectionMVPProps {
  onSelectRole: (role: "buyer" | "farmer" | "regulator") => void;
}

export default function UserRoleSelectionMVP({ onSelectRole }: UserRoleSelectionMVPProps) {
  return (
    <div className="h-screen bg-white flex flex-col overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img
            src={logoMagro}
            alt="MAGRO"
            className="w-48 mx-auto mb-12"
            style={{ mixBlendMode: 'multiply' }}
          />

          <h1 className="text-2xl text-center mb-8">Vous êtes...</h1>

          <div className="space-y-4">
            <motion.button
              onClick={() => onSelectRole("buyer")}
              className="w-full bg-white border-2 border-border hover:border-secondary rounded-2xl p-8 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-secondary" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl mb-2">Acheteur</h2>
                  <p className="text-muted-foreground">
                    J'achète des produits agricoles
                  </p>
                </div>
              </div>
            </motion.button>

            <motion.button
              onClick={() => onSelectRole("farmer")}
              className="w-full bg-white border-2 border-border hover:border-primary rounded-2xl p-8 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <Sprout className="w-10 h-10 text-primary" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl mb-2">Agriculteur</h2>
                  <p className="text-muted-foreground">
                    Je vends mes produits agricoles
                  </p>
                </div>
              </div>
            </motion.button>

            <motion.button
              onClick={() => onSelectRole("regulator")}
              className="w-full bg-white border-2 border-border hover:border-blue-600 rounded-2xl p-8 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <Monitor className="w-10 h-10 text-blue-600" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl mb-2">Projecteur & Régulateur</h2>
                  <p className="text-muted-foreground">
                    Je supervise et régule le marché
                  </p>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
