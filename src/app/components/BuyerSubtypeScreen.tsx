import { motion } from "motion/react";
import { ShoppingBag, Store, UtensilsCrossed, School, Factory } from "lucide-react";
import logoMagro from "../../imports/MAGRO.png";

interface BuyerSubtypeScreenProps {
  onSelectSubtype: (subtype: string) => void;
}

const buyerTypes = [
  {
    id: "individual",
    icon: ShoppingBag,
    label: "Particulier",
    description: "Pour mes besoins personnels"
  },
  {
    id: "merchant",
    icon: Store,
    label: "Commerçant / Grossiste",
    description: "Revente sur les marchés"
  },
  {
    id: "restaurant",
    icon: UtensilsCrossed,
    label: "Restaurateur / Hôtelier",
    description: "Pour mon établissement"
  },
  {
    id: "institution",
    icon: School,
    label: "Cantine / Institution",
    description: "École, hôpital, collectivité"
  },
  {
    id: "industry",
    icon: Factory,
    label: "Industrie",
    description: "Transformation, export"
  }
];

export default function BuyerSubtypeScreen({ onSelectSubtype }: BuyerSubtypeScreenProps) {
  return (
    <div className="h-screen bg-muted flex flex-col overflow-y-auto">
      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="text-sm text-muted-foreground mb-4">Étape 4b/5</div>
            <img
              src={logoMagro}
              alt="MAGRO"
              className="w-40 max-w-full mx-auto mb-4"
              style={{ mixBlendMode: 'multiply' }}
            />
            <h2 className="text-xl mb-2">Quel type d'acheteur ?</h2>
          </div>

          <div className="space-y-3 pb-6">
            {buyerTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <motion.button
                  key={type.id}
                  onClick={() => onSelectSubtype(type.id)}
                  className="w-full bg-white border-2 border-border hover:border-secondary rounded-2xl p-5 transition-all text-left group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                      <Icon className="w-7 h-7 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base mb-1">{type.label}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
