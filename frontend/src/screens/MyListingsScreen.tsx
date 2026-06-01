import { Plus, Edit2, Trash2 } from "lucide-react";
import { motion } from "motion/react";

interface Product {
  id: string;
  name: string;
  quantity: string;
  price: number;
  region: string;
  images?: string[];
}

interface MyListingsScreenProps {
  products: Product[];
  onBack: () => void;
  onCreate: () => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export default function MyListingsScreen({
  products,
  onBack,
  onCreate,
  onEdit,
  onDelete
}: MyListingsScreenProps) {
  return (
    <div className="h-screen bg-muted flex flex-col">
      {/* Header */}
      <div className="bg-primary text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl">Mes annonces</h1>
          <button
            onClick={onCreate}
            className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary/90 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl mb-2">Aucune annonce</h2>
            <p className="text-muted-foreground mb-6">
              Commencez par publier votre première annonce
            </p>
            <button
              onClick={onCreate}
              className="bg-secondary hover:bg-secondary/90 text-white px-8 py-3 rounded-xl transition-colors"
            >
              Publier une annonce
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                className="bg-white rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex gap-4 p-4">
                  {product.images && product.images.length > 0 && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      {product.region}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.quantity}
                    </p>
                    <p className="text-lg text-primary">
                      {product.price} FCFA/kg
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Button */}
      {products.length > 0 && (
        <div className="border-t border-border p-6">
          <button
            onClick={onBack}
            className="w-full bg-white border border-border hover:bg-muted text-foreground py-4 rounded-xl transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      )}
    </div>
  );
}

export type { Product };
