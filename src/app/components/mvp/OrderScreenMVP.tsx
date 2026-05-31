import { useState } from "react";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { motion } from "motion/react";
import { Product } from "./MarketplaceHomeMVP";

interface OrderScreenMVPProps {
  product: Product;
  onBack: () => void;
  onConfirm: () => void;
}

export default function OrderScreenMVP({ product, onBack, onConfirm }: OrderScreenMVPProps) {
  const [quantity, setQuantity] = useState(10);

  const totalPrice = quantity * product.price;

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">Commander</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Product Info */}
          <div className="bg-muted rounded-2xl p-4">
            <div className="flex gap-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-xl"
              />
              <div className="flex-1">
                <h3 className="text-base mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">{product.farmer}</p>
                <p className="text-primary">{product.price} FCFA/kg</p>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="bg-muted rounded-2xl p-6">
            <h2 className="text-sm text-muted-foreground mb-4 text-center">
              Quantité (kg)
            </h2>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 5))}
                className="w-12 h-12 bg-white rounded-xl flex items-center justify-center"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="text-center">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 text-center text-3xl bg-transparent border-none focus:outline-none"
                />
                <p className="text-sm text-muted-foreground">kilogrammes</p>
              </div>
              <button
                onClick={() => setQuantity(quantity + 5)}
                className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="bg-muted rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground">Sous-total ({quantity} kg)</span>
              <span className="text-lg">{totalPrice.toLocaleString()} FCFA</span>
            </div>
            <div className="h-px bg-border mb-4" />
            <div className="flex justify-between items-center">
              <span className="text-lg">Total</span>
              <span className="text-2xl text-primary">{totalPrice.toLocaleString()} FCFA</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirm Button */}
      <div className="border-t border-border p-6">
        <button
          onClick={onConfirm}
          className="w-full bg-secondary hover:bg-secondary/90 text-white py-4 rounded-xl transition-colors"
        >
          Confirmer la commande
        </button>
      </div>
    </div>
  );
}
