import { ArrowLeft, Star, MapPin, MessageCircle, Award, FileSpreadsheet } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Product } from "./MarketplaceHomeMVP";
import { fetchCertificationRequests } from "../../../services/certifications";
import { createSeasonalContract } from "../../../services/contracts";

interface ProductDetailMVPProps {
  product: Product;
  onBack: () => void;
  onOrder: () => void;
  onChat: () => void;
}

export default function ProductDetailMVP({ product, onBack, onOrder, onChat }: ProductDetailMVPProps) {
  const [certs, setCerts] = useState<any[]>([]);
  const [showContractDialog, setShowContractDialog] = useState(false);
  
  // Buyer profile checking
  const [isIndustrial, setIsIndustrial] = useState(() => localStorage.getItem("magro_buyer_subtype") === "industry");

  // Contract form state
  const [qtyTons, setQtyTons] = useState(10);
  const [priceKg, setPriceKg] = useState(product.price);
  const [seasonStart, setSeasonStart] = useState("2026-06-01");
  const [seasonEnd, setSeasonEnd] = useState("2026-11-30");

  useEffect(() => {
    fetchCertificationRequests()
      .then(data => setCerts(data))
      .catch(err => console.error(err));
  }, []);

  const getProductCert = () => {
    return certs.find(
      c => c.status === "ACTIVE" && 
      (c.cropName.toLowerCase().includes(product.name.toLowerCase()) || 
       product.name.toLowerCase().includes(c.cropName.toLowerCase()))
    );
  };

  const activeCert = getProductCert();

  const handleProposeContract = async () => {
    try {
      await createSeasonalContract({
        farmerId: "farmer-1", // Vendeur cible
        farmerName: product.farmer,
        cropName: product.name,
        totalQuantityKg: qtyTons * 1000,
        pricePerKg: priceKg,
        seasonStart,
        seasonEnd,
        deliverySchedule: { type: "mensuel", details: `${Math.round((qtyTons * 1000) / 6)} kg par mois` }
      });
      alert(`Proposition de contrat saisonnier de ${qtyTons} tonnes envoyée à ${product.farmer}.`);
      setShowContractDialog(false);
    } catch (err) {
      alert("Erreur lors de l'envoi du contrat.");
    }
  };

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
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <div className="flex items-start justify-between mb-3 gap-2">
              <h1 className="text-2xl font-bold text-gray-900 flex-1">{product.name}</h1>
              {activeCert ? (
                <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                  activeCert.badgeLevel === "GOLD" ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-gray-100 text-gray-800 border-gray-300"
                }`}>
                  {activeCert.badgeLevel === "GOLD" ? "🟡 OR Premium" : "⚪ ARGENT"}
                </span>
              ) : product.certified ? (
                <span className="text-xs px-3 py-1 bg-green-100 text-green-800 border border-green-300 rounded-full font-semibold">
                  🟢 Vert – Vérifié
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-4 text-muted-foreground mb-4">
              <div className="flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{product.region}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-4xl font-bold text-primary mb-1">{product.price} FCFA</p>
              <p className="text-xs text-muted-foreground">par kg</p>
            </div>

            <p className="text-sm font-semibold text-gray-700">{product.quantity}</p>
          </div>

          {/* Certification Grid Details (New functional block according to CDC 6.4) */}
          {activeCert && activeCert.criteriaDetail && (
            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-500 fill-amber-500" />
                Détails du score de certification ({activeCert.score}/100)
              </h3>
              
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-700 pt-1">
                <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                  <span className="text-muted-foreground block text-[10px]">Aspect visuel (max 30)</span>
                  <span className="font-semibold">{activeCert.criteriaDetail.aspect} pts</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                  <span className="text-muted-foreground block text-[10px]">Taux de Brix (max 25)</span>
                  <span className="font-semibold">{activeCert.criteriaDetail.brix} pts</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                  <span className="text-muted-foreground block text-[10px]">Stockage & Hygiène (max 20)</span>
                  <span className="font-semibold">{activeCert.criteriaDetail.hygiene} pts</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                  <span className="text-muted-foreground block text-[10px]">Pratiques (max 15)</span>
                  <span className="font-semibold">{activeCert.criteriaDetail.practices} pts</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-amber-100 col-span-2">
                  <span className="text-muted-foreground block text-[10px]">Registre de culture (max 10)</span>
                  <span className="font-semibold">{activeCert.criteriaDetail.traceability} pts</span>
                </div>
              </div>
            </div>
          )}

          {/* Farmer Info */}
          <div className="bg-muted rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Agriculteur</h3>
              <button
                onClick={onChat}
                className="flex items-center gap-1 text-primary text-sm font-semibold"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contacter</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary text-lg font-bold">
                {product.farmer.charAt(0)}
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900 mb-1">{product.farmer}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</h3>
            <p className="text-sm leading-relaxed text-gray-600">
              Produits cultivés de manière traditionnelle et écologique dans la région de {product.region}.
              Qualité garantie et contrôlée. Respect des protocoles de planification d'approvisionnement SHEP.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-border p-6 flex flex-col gap-3">
        {isIndustrial && (
          <button
            onClick={() => setShowContractDialog(true)}
            className="w-full bg-white border border-primary text-primary hover:bg-primary/5 py-3 rounded-xl transition-colors font-semibold flex items-center justify-center gap-2 text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Proposer un contrat saisonnier
          </button>
        )}
        <div className="flex gap-3">
          <button
            onClick={onChat}
            className="flex-shrink-0 w-14 h-14 bg-muted rounded-xl flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={onOrder}
            className="flex-1 bg-secondary hover:bg-secondary/90 text-white py-4 rounded-xl transition-colors font-semibold text-sm"
          >
            Commander maintenant
          </button>
        </div>
      </div>

      {/* Propose Seasonal Contract Modal Dialog */}
      <AnimatePresence>
        {showContractDialog && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-xl"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                Proposer un Contrat Saisonnier
              </h3>
              <p className="text-xs text-muted-foreground">
                Réservez un volume de production industrielle à l'année avec ce producteur.
              </p>
              
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Volume réservé (Tonnes)</label>
                  <input
                    type="number"
                    value={qtyTons}
                    onChange={(e) => setQtyTons(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Date début</label>
                    <input
                      type="date"
                      value={seasonStart}
                      onChange={(e) => setSeasonStart(e.target.value)}
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Date fin</label>
                    <input
                      type="date"
                      value={seasonEnd}
                      onChange={(e) => setSeasonEnd(e.target.value)}
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Prix unitaire convenu (FCFA/kg)</label>
                  <input
                    type="number"
                    value={priceKg}
                    onChange={(e) => setPriceKg(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleProposeContract}
                  className="flex-1 bg-primary hover:bg-primary/95 text-white text-xs py-3 rounded-xl font-bold transition-colors"
                >
                  Envoyer la proposition
                </button>
                <button
                  onClick={() => setShowContractDialog(false)}
                  className="bg-gray-100 text-gray-700 text-xs px-4 py-3 rounded-xl font-bold hover:bg-gray-200"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
