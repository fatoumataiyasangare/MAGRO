import { useState } from "react";
import { ArrowLeft, Minus, Plus, Calendar, MapPin, CreditCard } from "lucide-react";
import { motion } from "motion/react";
import { Product } from "./HomeScreen";

interface OrderScreenProps {
  product: Product;
  onBack: () => void;
  onConfirm: () => void;
}

export default function OrderScreen({ product, onBack, onConfirm }: OrderScreenProps) {
  const [quantity, setQuantity] = useState(10);
  const [deliveryDate, setDeliveryDate] = useState("2026-05-20");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mobile");

  const totalPrice = quantity * product.price;
  const deliveryFee = 5000;
  const finalTotal = totalPrice + deliveryFee;

  return (
    <div className="h-screen bg-muted flex flex-col">
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">Passer commande</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-2xl p-4">
            <h2 className="text-sm text-muted-foreground mb-3">Produit</h2>
            <div className="flex gap-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-xl"
              />
              <div className="flex-1">
                <h3 className="text-base mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.farmer}</p>
                <p className="text-sm text-primary">{product.price} FCFA/kg</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4">
            <h2 className="text-sm text-muted-foreground mb-4">Quantité (kg)</h2>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 5))}
                className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="text-center">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 text-center text-2xl bg-transparent border-none focus:outline-none"
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

          <div className="bg-white rounded-2xl p-4">
            <h2 className="text-sm text-muted-foreground mb-3">Date de livraison souhaitée</h2>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min="2026-05-15"
                className="w-full pl-12 pr-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4">
            <h2 className="text-sm text-muted-foreground mb-3">Adresse de livraison</h2>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 text-muted-foreground w-5 h-5" />
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Entrez votre adresse complète..."
                rows={3}
                className="w-full pl-12 pr-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4">
            <h2 className="text-sm text-muted-foreground mb-3">Mode de paiement</h2>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod("mobile")}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                  paymentMethod === "mobile"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "mobile" ? "border-primary" : "border-muted-foreground"
                }`}>
                  {paymentMethod === "mobile" && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </div>
                <CreditCard className="w-5 h-5" />
                <span>Orange Money / Moov Money</span>
              </button>
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                  paymentMethod === "cash"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "cash" ? "border-primary" : "border-muted-foreground"
                }`}>
                  {paymentMethod === "cash" && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </div>
                <span>Paiement à la livraison</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4">
            <h2 className="text-sm text-muted-foreground mb-4">Récapitulatif</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total ({quantity} kg)</span>
                <span>{totalPrice.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frais de livraison</span>
                <span>{deliveryFee.toLocaleString()} FCFA</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-lg">
                <span>Total</span>
                <span className="text-primary">{finalTotal.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          <div className="pb-6">
            <button
              onClick={onConfirm}
              disabled={!deliveryAddress}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmer la commande
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
