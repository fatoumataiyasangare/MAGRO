import { useState, useEffect } from "react";
import { ArrowLeft, Minus, Plus, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { Product } from "./MarketplaceHomeMVP";

interface OrderScreenMVPProps {
  product: Product;
  onBack: () => void;
  onConfirm: (quantity: number, depositRequired: boolean, depositAmount: number, riskScore: number) => void;
}

export default function OrderScreenMVP({ product, onBack, onConfirm }: OrderScreenMVPProps) {
  const [quantity, setQuantity] = useState(10);
  const [deliveryDays, setDeliveryDays] = useState(15);
  const [isTrustedPartner, setIsTrustedPartner] = useState(false);
  const [hasSellerDisputes, setHasSellerDisputes] = useState(false);
  
  // Payment option: 'full' or 'deposit'
  const [paymentOption, setPaymentOption] = useState<"full" | "deposit">("full");

  const totalPrice = quantity * product.price;

  // Risk Score Calculation logic (CDC Section 7.4)
  const [riskScore, setRiskScore] = useState(0);
  const [depositRequired, setDepositRequired] = useState(false);
  const [depositPercent, setDepositPercent] = useState(30); // 30% or 50%
  const [riskFactors, setRiskFactors] = useState<string[]>([]);

  useEffect(() => {
    let score = 0;
    const factors: string[] = [];
    let strongFactorsCount = 0;

    // 1. Amount > 500 000 FCFA (Strong)
    if (totalPrice > 500000) {
      score += 40;
      strongFactorsCount++;
      factors.push("Montant de transaction élevé (> 500 000 FCFA)");
    }

    // 2. Delivery delay > 45 days (Strong)
    if (deliveryDays > 45) {
      score += 40;
      strongFactorsCount++;
      factors.push("Délai de livraison à long terme (> 45 jours)");
    } else if (deliveryDays >= 21) {
      score += 20;
      factors.push("Délai de livraison moyen (21 à 45 jours)");
    }

    // 3. Farmer has disputes in the last 6 months (Strong)
    if (hasSellerDisputes) {
      score += 40;
      strongFactorsCount++;
      factors.push("Vendeur ayant des litiges récents (6 derniers mois)");
    }

    // 4. Delivery rate < 85% (Medium)
    if (product.rating < 4.6) {
      score += 30;
      factors.push("Taux de livraison conforme du vendeur faible (< 85%)");
    }

    // 5. Product quality rating / Badges (Weak)
    if (!product.certified) {
      score += 15;
      factors.push("Produit non certifié (absence de badge de qualité Or/Argent)");
    }

    // 6. Trusted pair check (CDC Rule: cancels all deposit requirements if client is recurring)
    if (isTrustedPartner) {
      score = 0;
      factors.splice(0, factors.length);
      factors.push("Partenaires de confiance : Relation de confiance établie (3+ transactions sans litige). Acompte facultatif.");
    }

    setRiskScore(score);
    setRiskFactors(factors);

    // Determine deposit requirement
    // Mandatory deposit if score > 35 and not trusted partner, or if any strong factor is present
    const isMandatory = (strongFactorsCount > 0 || score >= 40) && !isTrustedPartner;
    setDepositRequired(isMandatory);

    // If 2 strong factors are present: 50% deposit mandatory
    if (strongFactorsCount >= 2 && !isTrustedPartner) {
      setDepositPercent(50);
      setPaymentOption("deposit"); // Auto-select deposit
    } else {
      setDepositPercent(30);
      if (isMandatory) {
        setPaymentOption("deposit");
      }
    }
  }, [totalPrice, deliveryDays, isTrustedPartner, hasSellerDisputes, product.certified, product.rating]);

  const depositAmount = Math.round(totalPrice * (depositPercent / 100));

  const handleConfirmOrder = () => {
    const isDepositSelected = paymentOption === "deposit";
    onConfirm(
      quantity,
      isDepositSelected && depositRequired,
      isDepositSelected ? depositAmount : 0,
      riskScore
    );
  };

  return (
    <div className="h-screen bg-white flex flex-col pb-6">
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
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
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

          {/* Configuration Simulator Options (To test risk score calculations) */}
          <div className="bg-muted rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Paramètres de commande (Approche SHEP/Risques)
            </h3>
            
            {/* Delivery Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Délai de livraison convenu :</span>
                <span className="font-semibold text-primary">{deliveryDays} jours</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-2 pt-2">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSellerDisputes}
                  onChange={(e) => setHasSellerDisputes(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>Ce vendeur a des litiges récents (&lt; 6 mois)</span>
              </label>

              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTrustedPartner}
                  onChange={(e) => setIsTrustedPartner(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-secondary font-semibold">Partenaire de confiance (3+ commandes conformes)</span>
              </label>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="bg-muted rounded-2xl p-4">
            <h2 className="text-sm text-muted-foreground mb-4 text-center">
              Quantité (kg)
            </h2>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 50))}
                className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-border"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="text-center">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 text-center text-3xl font-semibold bg-transparent border-none focus:outline-none"
                />
                <p className="text-xs text-muted-foreground">kilogrammes</p>
              </div>
              <button
                onClick={() => setQuantity(quantity + 50)}
                className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Risk Score & Deposit Info Panel */}
          <div className="bg-muted rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Calcul du score de risque</span>
              <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${
                riskScore >= 70 ? "bg-red-100 text-red-700" :
                riskScore >= 35 ? "bg-yellow-100 text-yellow-700" :
                "bg-green-100 text-green-700"
              }`}>
                {riskScore} / 100
              </span>
            </div>

            {/* Risk details list */}
            {riskFactors.length > 0 && (
              <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1 mb-4">
                {riskFactors.map((fact, idx) => (
                  <li key={idx}>{fact}</li>
                ))}
              </ul>
            )}

            {/* Security notification */}
            {depositRequired ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex gap-2.5 items-start text-xs text-yellow-800">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Acompte de {depositPercent}% Obligatoire</span> : En raison d'un score de risque élevé, la plateforme impose le versement d'un acompte pour initier cette commande de pré-production.
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex gap-2.5 items-start text-xs text-green-800">
                <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Paiement Sécurisé MAGRO Escrow</span> : Les fonds restent bloqués sur un compte séquestre de confiance et ne sont versés au producteur qu'après votre confirmation de livraison.
                </div>
              </div>
            )}
          </div>

          {/* Payment Selection Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Mode de paiement</h3>
            
            {/* Pay 100% Escrow Option */}
            <label className={`block border p-4 rounded-xl cursor-pointer transition-colors ${
              paymentOption === "full" ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
            }`}>
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentOption === "full"}
                  disabled={depositRequired && depositPercent === 50} // 50% deposit might lock full option
                  onChange={() => setPaymentOption("full")}
                  className="mt-1 text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <div className="flex justify-between font-semibold text-sm mb-1">
                    <span>Séquestre Total (100%)</span>
                    <span className="text-primary">{totalPrice.toLocaleString()} FCFA</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Bloquer l'intégralité du montant de la commande dans le séquestre sécurisé.
                  </p>
                </div>
              </div>
            </label>

            {/* Pay Deposit Option */}
            <label className={`block border p-4 rounded-xl cursor-pointer transition-colors ${
              paymentOption === "deposit" ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
            }`}>
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentOption === "deposit"}
                  onChange={() => setPaymentOption("deposit")}
                  className="mt-1 text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <div className="flex justify-between font-semibold text-sm mb-1">
                    <span>Acompte Securisé ({depositPercent}%)</span>
                    <span className="text-secondary">{depositAmount.toLocaleString()} FCFA</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Payer l'acompte initial de {depositPercent}% pour valider la commande, le reste ({100 - depositPercent}%) à la livraison.
                  </p>
                </div>
              </div>
            </label>
          </div>

          {/* Pricing Summary */}
          <div className="bg-muted rounded-2xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total ({quantity} kg)</span>
              <span>{totalPrice.toLocaleString()} FCFA</span>
            </div>
            {paymentOption === "deposit" && (
              <>
                <div className="flex justify-between text-secondary">
                  <span>Acompte à payer immédiatement ({depositPercent}%)</span>
                  <span>{depositAmount.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Reste à payer à la livraison ({100 - depositPercent}%)</span>
                  <span>{(totalPrice - depositAmount).toLocaleString()} FCFA</span>
                </div>
              </>
            )}
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between text-base font-semibold">
              <span>Total à payer aujourd'hui</span>
              <span className="text-primary text-lg">
                {paymentOption === "deposit" ? depositAmount.toLocaleString() : totalPrice.toLocaleString()} FCFA
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirm Button */}
      <div className="border-t border-border px-6 pt-4">
        <button
          onClick={handleConfirmOrder}
          className="w-full bg-secondary hover:bg-secondary/90 text-white py-4 rounded-xl transition-colors font-semibold"
        >
          Confirmer la commande (Mobile Money)
        </button>
      </div>
    </div>
  );
}
