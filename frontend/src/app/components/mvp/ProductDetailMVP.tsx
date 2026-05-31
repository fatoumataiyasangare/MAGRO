import { ArrowLeft, Star, MapPin, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { Product } from "./MarketplaceHomeMVP";

interface ProductDetailMVPProps {
  product: Product;
  onBack: () => void;
  onOrder: () => void;
  onChat: () => void;
}

export default function ProductDetailMVP({ product, onBack, onOrder, onChat }: ProductDetailMVPProps) {
  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Image */}
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-72 object-cover"
        />
        <button
          onClick={onBack}
          className="absolute top-6 left-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6">
            <div className="flex items-start justify-between mb-3">
              <h1 className="text-2xl flex-1">{product.name}</h1>
              {product.certified && (
                <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full">
                  🟢 Vérifié
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{product.region}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-4xl text-primary mb-1">{product.price} FCFA</p>
              <p className="text-muted-foreground">par kg</p>
            </div>

            <p className="text-muted-foreground mb-6">{product.quantity}</p>
          </div>

          {/* Farmer Info */}
          <div className="bg-muted rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm">Agriculteur</h3>
              <button
                onClick={onChat}
                className="flex items-center gap-1 text-primary text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contacter</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary text-lg">
                {product.farmer.charAt(0)}
              </div>
              <div>
                <p className="text-base mb-1">{product.farmer}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm">{product.rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm text-muted-foreground mb-2">Description</h3>
            <p className="text-base leading-relaxed">
              Produits cultivés de manière traditionnelle et écologique dans la région de {product.region}.
              Qualité garantie et contrôlée.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom Action */}
      <div className="border-t border-border p-6">
        <div className="flex gap-3">
          <button
            onClick={onChat}
            className="flex-shrink-0 w-14 h-14 bg-muted rounded-xl flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          <button
            onClick={onOrder}
            className="flex-1 bg-secondary hover:bg-secondary/90 text-white py-4 rounded-xl transition-colors"
          >
            Commander maintenant
          </button>
        </div>
      </div>
    </div>
  );
}
