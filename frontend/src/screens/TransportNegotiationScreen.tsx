import { useState } from "react";
import { ArrowLeft, Truck, Phone, MapPin, Star, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TransportNegotiationProps {
  onBack: () => void;
  orderId?: string;
  orderCrop?: string;
  orderRegion?: string;
  orderQuantity?: string;
}

interface Transporter {
  id: string;
  name: string;
  phone: string;
  rating: number;
  trips: number;
  region: string;
  vehicleType: string;
  pricePerKm: number;
  estimatedPrice: number;
  available: boolean;
}

const MOCK_TRANSPORTERS: Transporter[] = [
  {
    id: "t1",
    name: "Boubacar Diallo",
    phone: "+22376543210",
    rating: 4.8,
    trips: 142,
    region: "Sikasso → Bamako",
    vehicleType: "🚛 Camionnette 3T",
    pricePerKm: 250,
    estimatedPrice: 35000,
    available: true
  },
  {
    id: "t2",
    name: "Oumar Sanogo",
    phone: "+22365432109",
    rating: 4.5,
    trips: 87,
    region: "Koulikoro → Bamako",
    vehicleType: "🚐 Fourgon 1.5T",
    pricePerKm: 180,
    estimatedPrice: 22000,
    available: true
  },
  {
    id: "t3",
    name: "Drissa Coulibaly",
    phone: "+22354321098",
    rating: 4.2,
    trips: 54,
    region: "Ségou → Bamako",
    vehicleType: "🚛 Camion 5T",
    pricePerKm: 300,
    estimatedPrice: 48000,
    available: false
  }
];

export default function TransportNegotiationScreen({ onBack, orderId, orderCrop, orderRegion, orderQuantity }: TransportNegotiationProps) {
  const [selectedTransporter, setSelectedTransporter] = useState<Transporter | null>(null);
  const [negotiatedPrice, setNegotiatedPrice] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [tab, setTab] = useState<"list" | "negotiate">("list");

  const handleNegotiate = (t: Transporter) => {
    setSelectedTransporter(t);
    setNegotiatedPrice(t.estimatedPrice.toString());
    setTab("negotiate");
  };

  const handleSubmitOffer = () => {
    if (!negotiatedPrice) return;
    setSubmitted(true);
  };

  return (
    <div className="h-screen bg-muted flex flex-col">
      {/* Header */}
      <div className="bg-primary text-white px-6 pt-8 pb-5">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={tab === "negotiate" ? () => setTab("list") : onBack}
            className="p-2 -ml-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">
              {tab === "list" ? "Transporteurs disponibles" : `Négocier avec ${selectedTransporter?.name}`}
            </h1>
            {orderCrop && (
              <p className="text-white/70 text-xs mt-0.5">
                {orderCrop} • {orderQuantity} • {orderRegion}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
        <AnimatePresence mode="wait">
          {tab === "list" ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <p className="text-xs text-muted-foreground mb-3">
                Contactez directement un transporteur ou soumettez une offre de prix. Tous les transporteurs sont vérifiés par MAGRO.
              </p>

              {MOCK_TRANSPORTERS.map((t, index) => (
                <motion.div
                  key={t.id}
                  className={`bg-white rounded-2xl p-4 border shadow-sm ${!t.available ? "opacity-60" : "border-border"}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                      {t.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-sm">{t.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          t.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {t.available ? "✅ Disponible" : "❌ Indisponible"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-semibold text-gray-700">{t.rating}</span>
                        <span className="text-xs text-muted-foreground">• {t.trips} trajets</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl mb-3">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Truck className="w-3.5 h-3.5" />
                      <span>{t.vehicleType}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{t.region}</span>
                    </div>
                    <div className="col-span-2 flex justify-between items-center pt-1 border-t border-gray-100">
                      <span className="text-muted-foreground">Tarif estimé</span>
                      <span className="font-bold text-primary text-sm">
                        {new Intl.NumberFormat("fr-FR").format(t.estimatedPrice)} FCFA
                      </span>
                    </div>
                  </div>

                  {t.available && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleNegotiate(t)}
                        className="flex-1 bg-primary text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        Négocier le prix
                      </button>
                      <a
                        href={`tel:${t.phone}`}
                        className="flex items-center justify-center gap-1.5 bg-green-100 text-green-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-green-200 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Appeler
                      </a>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-64 text-center gap-4"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Offre envoyée !</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTransporter?.name} a reçu votre proposition de{" "}
                  <strong>{new Intl.NumberFormat("fr-FR").format(parseInt(negotiatedPrice))} FCFA</strong>.
                </p>
                <p className="text-xs text-muted-foreground mt-2">Il vous contactera sous 2h.</p>
              </div>
              <button
                onClick={onBack}
                className="bg-primary text-white py-3 px-8 rounded-xl font-bold text-sm cursor-pointer"
              >
                Retour aux commandes
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="negotiate"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="space-y-4"
            >
              {/* Transporter summary */}
              <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                    {selectedTransporter?.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedTransporter?.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-gray-700">{selectedTransporter?.rating} • {selectedTransporter?.trips} trajets</span>
                    </div>
                  </div>
                </div>
                <div className="bg-muted rounded-xl p-3 text-xs text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>Tarif habituel :</span>
                    <span className="font-semibold">{new Intl.NumberFormat("fr-FR").format(selectedTransporter?.estimatedPrice || 0)} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Véhicule :</span>
                    <span className="font-semibold">{selectedTransporter?.vehicleType}</span>
                  </div>
                </div>
              </div>

              {/* Negotiation form */}
              <div className="bg-white rounded-2xl p-4 border border-border shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Votre proposition</h3>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Prix proposé (FCFA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={negotiatedPrice}
                    onChange={(e) => setNegotiatedPrice(e.target.value)}
                    placeholder="Ex: 28000"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {selectedTransporter && parseInt(negotiatedPrice) < selectedTransporter.estimatedPrice * 0.7 && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-amber-600">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="text-xs">Offre très basse — risque de refus</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Message (optionnel)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ex: Marchandise fragile, besoin de protection..."
                    rows={3}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    Une fois acceptée par le transporteur, le montant du transport sera ajouté au total de votre commande.
                  </p>
                </div>

                <button
                  onClick={handleSubmitOffer}
                  disabled={!negotiatedPrice}
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  Envoyer l'offre à {selectedTransporter?.name}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
