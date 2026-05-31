import { ShoppingBag, Sprout } from "lucide-react";
import { motion } from "motion/react";
import logoMagro from "../../imports/MAGRO.png";

interface SignupUserTypeScreenProps {
  onSelectType: (type: "buyer" | "farmer") => void;
}

export default function SignupUserTypeScreen({ onSelectType }: SignupUserTypeScreenProps) {
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
            <h2 className="text-xl mb-2">Vous êtes...</h2>
            <p className="text-muted-foreground text-sm">
              Sélectionnez votre profil
            </p>
          </div>

          <div className="space-y-4">
            <motion.button
              onClick={() => onSelectType("buyer")}
              className="w-full bg-white border-2 border-border hover:border-primary rounded-2xl p-8 transition-all active:scale-[0.98] group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <ShoppingBag className="w-10 h-10 text-secondary" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg mb-1">Acheteur / Client</h3>
                  <p className="text-sm text-muted-foreground">
                    Je souhaite acheter des produits agricoles
                  </p>
                </div>
              </div>
            </motion.button>

            <motion.button
              onClick={() => onSelectType("farmer")}
              className="w-full bg-white border-2 border-border hover:border-primary rounded-2xl p-8 transition-all active:scale-[0.98] group"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Sprout className="w-10 h-10 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg mb-1">Producteur / Agriculteur</h3>
                  <p className="text-sm text-muted-foreground">
                    Je souhaite vendre mes produits agricoles
                  </p>
                </div>
              </div>
            </motion.button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-8">
            Vous pourrez modifier votre profil plus tard dans les paramètres
          </p>
        </motion.div>
      </div>
    </div>
  );
}
