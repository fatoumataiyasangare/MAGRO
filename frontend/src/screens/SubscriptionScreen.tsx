import { ArrowLeft, Check, Shield, Zap, Info, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { getConfig } from "../services/config";

interface SubscriptionScreenProps {
  onBack: () => void;
}

export default function SubscriptionScreen({ onBack }: SubscriptionScreenProps) {
  const [isPremium, setIsPremium] = useState<boolean>(() => localStorage.getItem("magro_premium_status") === "true");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (plan: "standard" | "premium") => {
    setIsLoading(true);
    
    // Simulation du paiement (Mobile Money)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const nextVal = plan === "premium";
    setIsPremium(nextVal);
    localStorage.setItem("magro_premium_status", String(nextVal));
    setIsLoading(false);
    
    if (nextVal) {
      alert("Félicitations ! Votre abonnement Premium MAGRO est activé avec succès via Orange Money.");
    } else {
      alert("Votre abonnement a été rétrogradé au plan Standard.");
    }
  };

  return (
    <div className="h-screen bg-muted flex flex-col">
      <div className="bg-white px-6 pt-6 pb-4 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Abonnements</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Passez à la vitesse supérieure</h2>
          <p className="text-muted-foreground text-sm">Débloquez des fonctionnalités exclusives pour vendre et acheter plus intelligemment.</p>
        </div>

        <div className="space-y-6">
          {/* Plan Standard */}
          <motion.div 
            className={`bg-white rounded-3xl p-6 border-2 transition-all ${!isPremium ? "border-gray-300 shadow-md" : "border-transparent"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Standard</h3>
                <p className="text-sm text-gray-500">Pour débuter</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">Gratuit</span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-sm text-gray-700">Création de profil (Agriculteur/Acheteur)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-sm text-gray-700">Jusqu'à 5 annonces simultanées</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-sm text-gray-700">Messagerie standard</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-sm text-gray-700">Accès aux alertes (délai normal)</span>
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe("standard")}
              disabled={!isPremium || isLoading}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${!isPremium ? "bg-gray-100 text-gray-500 cursor-default" : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"}`}
            >
              {!isPremium ? "Plan actuel" : "Passer au Standard"}
            </button>
          </motion.div>

          {/* Plan Premium */}
          <motion.div 
            className={`bg-gradient-to-b from-blue-50 to-white rounded-3xl p-6 border-2 transition-all relative overflow-hidden ${isPremium ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-blue-200"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {isPremium && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                ACTIF
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  Premium
                  <Zap className="w-5 h-5 text-blue-500 fill-blue-500" />
                </h3>
                <p className="text-sm text-blue-700">Pour les professionnels</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-900">5 000</span>
                <span className="text-sm text-blue-700"> FCFA/mois</span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-500 mt-0.5" />
                <span className="text-sm text-gray-900 font-medium">Annonces illimitées</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-500 mt-0.5" />
                <span className="text-sm text-gray-900 font-medium">2h d'avance sur les alertes de disponibilité</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-500 mt-0.5" />
                <span className="text-sm text-gray-900 font-medium">Badge Premium sur votre profil</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-500 mt-0.5" />
                <span className="text-sm text-gray-900 font-medium">Support prioritaire 24/7</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-500 mt-0.5" />
                <span className="text-sm text-gray-900 font-medium">Filtre "Qualité Certifiée" débloqué</span>
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe("premium")}
              disabled={isPremium || isLoading}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isPremium ? "bg-blue-100 text-blue-500 cursor-default" : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-lg shadow-blue-500/30"}`}
            >
              {isLoading && !isPremium ? (
                "Paiement en cours..."
              ) : isPremium ? (
                <>Plan actuel <Check className="w-5 h-5" /></>
              ) : (
                "S'abonner avec Orange Money"
              )}
            </button>
            
            {!isPremium && (
              <p className="text-xs text-center text-blue-600 mt-3 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> Paiement 100% sécurisé
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
