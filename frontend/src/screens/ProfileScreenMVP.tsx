import { ArrowLeft, Settings, LogOut, ChevronRight, Star, Shield, Zap, Check } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { submitVerificationRequest } from "../../../services/verifications";

interface ProfileScreenMVPProps {
  userName: string;
  userRole: "buyer" | "farmer" | "regulator";
  onBack: () => void;
  onLogout: () => void;
}

export default function ProfileScreenMVP({ userName, userRole, onBack, onLogout }: ProfileScreenMVPProps) {
  const [buyerType, setBuyerType] = useState<string>(() => localStorage.getItem("magro_buyer_subtype") || "individual");
  const [isPremium, setIsPremium] = useState<boolean>(() => localStorage.getItem("magro_premium_status") === "true");
  const [isVerified, setIsVerified] = useState<boolean>(() => localStorage.getItem("magro_verified_status") === "true");
  const [verificationSubmitted, setVerificationSubmitted] = useState<boolean>(() => localStorage.getItem("magro_verification_submitted") === "true");
  
  // Verification form state
  const [showVerificationForm, setShowVerificationForm] = useState(false);
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
          <button onClick={onBack}>
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
      <div className="flex-1 overflow-y-auto -mt-6">
        <motion.div
          className="bg-white rounded-t-3xl px-6 py-6 min-h-full"
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
                  className={`text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${
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
                      className="text-xs font-semibold bg-white border border-green-200 text-green-700 px-4 py-2 rounded-xl hover:bg-green-100"
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
                      className="w-full bg-green-600 text-white text-xs py-2 rounded-xl hover:bg-green-700 font-semibold"
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
              <button className="text-sm text-primary">Voir tout</button>
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

            <button className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span>Paramètres du compte</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-muted-foreground" />
                <span>Mes avis</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors mb-6"
          >
            <LogOut className="w-5 h-5" />
            <span>Se déconnecter</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
