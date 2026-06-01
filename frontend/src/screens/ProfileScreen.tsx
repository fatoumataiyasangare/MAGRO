import { ArrowLeft, Settings, LogOut, ChevronRight, Star, Shield, Zap, Check, Globe, Bell, HelpCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { submitVerificationRequest } from "../services/verifications";

interface ProfileScreenMVPProps {
  userName: string;
  userRole: "buyer" | "farmer" | "regulator";
  onBack: () => void;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

export default function ProfileScreenMVP({ userName, userRole, onBack, onLogout, onNavigate }: ProfileScreenMVPProps) {
  const [buyerType, setBuyerType] = useState<string>(() => localStorage.getItem("magro_buyer_subtype") || "individual");
  const [isPremium, setIsPremium] = useState<boolean>(() => localStorage.getItem("magro_premium_status") === "true");
  const [isVerified, setIsVerified] = useState<boolean>(() => localStorage.getItem("magro_verified_status") === "true");
  const [verificationSubmitted, setVerificationSubmitted] = useState<boolean>(() => localStorage.getItem("magro_verification_submitted") === "true");
  
  // Verification form state
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [idDoc, setIdDoc] = useState("");
  const [parcelGps, setParcelGps] = useState("");
  const [bizReg, setBizReg] = useState("");

  const orders = [
    { id: "1", product: "Tomates fraîches", quantity: "50 kg", status: "Livrée", date: "15 Avr 2026" },
    { id: "2", product: "Oignons blancs", quantity: "100 kg", status: "En cours", date: "20 Avr 2026" }
  ];

  const handleBuyerTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setBuyerType(val);
    localStorage.setItem("magro_buyer_subtype", val);
    alert(`Type d'acheteur mis à jour : ${val}`);
  };

  const handleTogglePremium = () => {
    const nextVal = !isPremium;
    setIsPremium(nextVal);
    localStorage.setItem("magro_premium_status", String(nextVal));
    alert(nextVal ? "Abonnement Premium activé ! Profitez de la fenêtre exclusive de 2h pour les alertes." : "Abonnement Premium résilié.");
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idDoc) {
      alert("La pièce d'identité est obligatoire.");
      return;
    }
    try {
      await submitVerificationRequest({
        identityCardUrl: idDoc,
        parcelPhotoUrl: userRole === "farmer" ? "Photo_Parcelle.jpg" : undefined,
        gpsCoordinates: userRole === "farmer" ? parcelGps : undefined,
        tradeRegistryUrl: buyerType === "industry" ? bizReg : undefined
      }, userName, userRole);
      
      setVerificationSubmitted(true);
      localStorage.setItem("magro_verification_submitted", "true");
      setShowVerificationForm(false);
      alert("Votre dossier de vérification a été envoyé pour examen au modérateur MAGRO.");
    } catch (err) {
      alert("Erreur lors de l'envoi du dossier.");
    }
  };

  return (
    <div className="h-screen bg-muted flex flex-col">
      {/* Header */}
      <div className="bg-primary text-white px-6 pt-6 pb-12">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="cursor-pointer">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">Profil</h1>
        </div>

        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl mb-4">
              {userName.charAt(0)}
            </div>
            {isVerified && (
              <span className="absolute bottom-4 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white" title="Profil vérifié (Badge Vert)">
                ✓
              </span>
            )}
          </div>
          
          <h2 className="text-2xl mb-1 flex items-center gap-2">
            {userName}
            {isVerified && <span className="text-xs px-2 py-0.5 bg-green-500 text-white rounded-full">🟢 Vérifié</span>}
          </h2>
          <p className="text-white/80">
            {userRole === "farmer"
              ? "Agriculteur"
              : userRole === "regulator"
              ? "Projecteur & Régulateur"
              : "Acheteur"}
            {isPremium && " • Premium ✨"}
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <motion.div
          className="bg-white rounded-3xl p-6 min-h-full shadow-sm border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Subscriptions & Badges (New functional modules conforming to design) */}
          {userRole !== "regulator" && (
            <div className="mb-6 space-y-3">
              {/* Premium subscription card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-900 flex items-center gap-1.5 text-sm">
                    <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
                    Abonnement Premium MAGRO
                  </h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Annonces illimitées & 2h d'avance sur les alertes
                  </p>
                </div>
                <button
                  onClick={handleTogglePremium}
                  className={`text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                    isPremium ? "bg-blue-600 text-white" : "bg-white border border-blue-200 text-blue-700"
                  }`}
                >
                  {isPremium ? "Premium Actif" : "S'abonner"}
                </button>
              </div>

              {/* Identity Verification badge card */}
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-900 flex items-center gap-1.5 text-sm">
                      <Shield className="w-4 h-4 text-green-600" />
                      Vérification d'Identité (Badge Vert)
                    </h4>
                    <p className="text-xs text-green-700 mt-1">
                      {isVerified 
                        ? "Félicitations, votre identité a été approuvée !" 
                        : verificationSubmitted 
                        ? "Dossier en cours d'analyse par les modérateurs." 
                        : "Veuillez soumettre vos justificatifs pour obtenir le badge Vert."}
                    </p>
                  </div>
                  {!isVerified && !verificationSubmitted && (
                    <button
                      onClick={() => setShowVerificationForm(!showVerificationForm)}
                      className="text-xs font-semibold bg-white border border-green-200 text-green-700 px-4 py-2 rounded-xl hover:bg-green-100 cursor-pointer"
                    >
                      {showVerificationForm ? "Fermer" : "Soumettre"}
                    </button>
                  )}
                </div>

                {/* Submitting verification documents form */}
                {showVerificationForm && (
                  <form onSubmit={handleVerificationSubmit} className="mt-4 pt-4 border-t border-green-200/50 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Pièce d'identité (CNI / Passeport)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: CNI_Numero_12345.jpg"
                        value={idDoc}
                        onChange={(e) => setIdDoc(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>

                    {userRole === "farmer" && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Localisation de la parcelle (Coordonnées GPS)
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 12.6392° N, 8.0029° W"
                          value={parcelGps}
                          onChange={(e) => setParcelGps(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none"
                        />
                      </div>
                    )}

                    {buyerType === "industry" && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Registre de Commerce (RCCM)
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: MA.BKO.2026.B.1234"
                          value={bizReg}
                          onChange={(e) => setBizReg(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white text-xs py-2 rounded-xl hover:bg-green-700 font-semibold cursor-pointer"
                    >
                      Envoyer le dossier
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Buyer subtype selection */}
          {userRole === "buyer" && (
            <div className="bg-muted rounded-2xl p-4 mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Type de profil Acheteur
              </label>
              <select
                value={buyerType}
                onChange={handleBuyerTypeChange}
                className="w-full p-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="individual">Particulier</option>
                <option value="trader">Commerçant / Grossiste</option>
                <option value="restaurant">Restaurateur / Hôtelier</option>
                <option value="institution">Cantine / Institution</option>
                <option value="industry">Industriel / Transformateur</option>
              </select>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-muted rounded-2xl p-4 text-center">
              <p className="text-2xl text-primary mb-1">8</p>
              <p className="text-xs text-muted-foreground">Commandes</p>
            </div>
            <div className="bg-muted rounded-2xl p-4 text-center">
              <p className="text-2xl text-secondary mb-1">4.5</p>
              <p className="text-xs text-muted-foreground">Note</p>
            </div>
          </div>

          {/* Orders History */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg">Mes commandes</h3>
              <button onClick={() => onNavigate('orders')} className="text-sm text-primary cursor-pointer">Voir tout</button>
            </div>

            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-muted rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-base mb-1">{order.product}</h4>
                      <p className="text-sm text-muted-foreground">{order.quantity} • {order.date}</p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        order.status === "Livrée"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-2 mb-8">
            <h3 className="text-lg mb-4">Paramètres</h3>

            <button onClick={() => setShowSettings(!showSettings)} className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span>Paramètres du compte</span>
              </div>
              <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${showSettings ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-muted/50 rounded-xl p-4 space-y-3 mt-1">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <Globe className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Langue</p>
                        <p className="text-xs text-muted-foreground">Français — Changer la langue de l'application</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <Bell className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Notifications</p>
                        <p className="text-xs text-muted-foreground">Gérer les alertes prix, commandes et messages</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <HelpCircle className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Aide</p>
                        <p className="text-xs text-muted-foreground">Centre d'aide et FAQ — Contactez le support</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={() => setShowReviews(!showReviews)} className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-muted-foreground" />
                <span>Mes avis</span>
              </div>
              <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${showReviews ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
              {showReviews && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-muted/50 rounded-xl p-4 space-y-3 mt-1">
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= 5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}
                      </div>
                      <p className="text-sm font-medium">Tomates excellentes</p>
                      <p className="text-xs text-muted-foreground">Très frais et bien emballé. Livraison rapide !</p>
                      <p className="text-xs text-muted-foreground mt-1">— Amadou K. • 12 Avr 2026</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}
                      </div>
                      <p className="text-sm font-medium">Bon rapport qualité-prix</p>
                      <p className="text-xs text-muted-foreground">Les oignons étaient de bonne taille. Je recommande.</p>
                      <p className="text-xs text-muted-foreground mt-1">— Fatoumata D. • 8 Avr 2026</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= 3 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}
                      </div>
                      <p className="text-sm font-medium">Correct mais délai long</p>
                      <p className="text-xs text-muted-foreground">Produit conforme mais la livraison a pris 3 jours de plus.</p>
                      <p className="text-xs text-muted-foreground mt-1">— Ibrahim S. • 2 Avr 2026</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors mb-6 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Se déconnecter</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
