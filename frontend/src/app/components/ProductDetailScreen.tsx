import { ArrowLeft, Star, MapPin, Calendar, Shield, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Product } from "./HomeScreen";

interface ProductDetailScreenProps {
  product: Product;
  onBack: () => void;
  onOrder: (product: Product) => void;
  onChat: () => void;
}

export default function ProductDetailScreen({ product, onBack, onOrder, onChat }: ProductDetailScreenProps) {
  return (
    <div className="h-screen bg-white flex flex-col">
      <div className="relative">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-72 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />

        <button
          onClick={onBack}
          className="absolute top-6 left-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {product.quality && (
          <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-white text-sm flex items-center gap-1 ${
            product.quality === "premium" ? "bg-yellow-500" : "bg-gray-400"
          }`}>
            <Star className="w-4 h-4 fill-white" />
            <span>{product.quality === "premium" ? "Premium" : "Bonne qualité"}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <motion.div
          className="p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6">
            <div className="flex items-start justify-between mb-3">
              <h1 className="text-2xl flex-1">{product.name}</h1>
              {product.verified && (
                <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Vérifié</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{product.region}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm">{product.rating}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl text-primary">{product.price} FCFA</span>
              <span className="text-muted-foreground">par kg</span>
            </div>
          </div>

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
                <p className="text-base">{product.farmer}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <span>{product.rating} • 127 ventes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Quantité disponible</h3>
              <p className="text-base">{product.quantity}</p>
            </div>

            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Disponibilité</h3>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-base">Récolte prévue: 15-20 Mai 2026</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Description</h3>
              <p className="text-base leading-relaxed">
                Produits cultivés de manière traditionnelle et écologique dans la région de {product.region}.
                Qualité garantie et contrôlée. Précommandez maintenant pour garantir votre approvisionnement.
              </p>
            </div>
          </div>

          <div className="bg-accent/30 border border-accent rounded-2xl p-4 mb-6">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm mb-1">Garantie de qualité</h4>
                <p className="text-sm text-muted-foreground">
                  Paiement sécurisé • Livraison garantie • Retour possible
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="border-t border-border p-6 bg-white">
        <div className="flex gap-3">
          <button
            onClick={onChat}
            className="flex-shrink-0 w-14 h-14 bg-muted rounded-xl flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          <button
            onClick={() => onOrder(product)}
            className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground py-4 rounded-xl transition-colors"
          >
            Commander maintenant
          </button>
        </div>
      </div>
    </div>
  );
}
