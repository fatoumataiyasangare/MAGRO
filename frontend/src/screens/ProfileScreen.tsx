import { ArrowLeft, Settings, LogOut, ChevronRight, Star, Shield, Zap, Check, Globe, Bell, HelpCircle, X, Package, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { submitVerificationRequest } from "../services/verifications";
import { UserProfile, requestAccountDeletion } from "../services/auth";
import { fetchBuyerOrders, fetchFarmerOrders, FarmerOrder } from "../services/orders";
import { useToast } from "../components/ToastProvider";
import { getInitials } from "../utils/format";

interface ProfileScreenMVPProps {
  userProfile: UserProfile | null;
  userName: string;
  userRole: "buyer" | "farmer" | "regulator" | "moderator" | "super_admin" | "analyst" | string;
  onBack: () => void;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

export default function ProfileScreenMVP({ userProfile, userName, userRole, onBack, onLogout, onNavigate }: ProfileScreenMVPProps) {
  const isAdmin = ["regulator", "moderator", "super_admin", "analyst"].includes(userRole);
  const [buyerType, setBuyerType] = useState<string>(() => userProfile?.buyerType || localStorage.getItem("magro_buyer_subtype") || "individual");
  const [isPremium, setIsPremium] = useState<boolean>(() => userProfile?.isPremium || localStorage.getItem("magro_premium_status") === "true");
  const [isVerified, setIsVerified] = useState<boolean>(() => userProfile?.isVerified || localStorage.getItem("magro_verified_status") === "true");
  const [verificationSubmitted, setVerificationSubmitted] = useState<boolean>(() => localStorage.getItem("magro_verification_submitted") === "true");

  // Verification form state
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [idDoc, setIdDoc] = useState("");
  const [parcelGps, setParcelGps] = useState("");
  const [bizReg, setBizReg] = useState("");

  // Real orders from API
  const [orders, setOrders] = useState<FarmerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(false);

  useEffect(() => {
    if (isAdmin) return;
    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError(false);
      try {
        const data = userRole === "farmer"
          ? await fetchFarmerOrders()
          : await fetchBuyerOrders();
        setOrders(data);
      } catch {
        setOrdersError(true);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [userRole, isAdmin]);

  const { showToast } = useToast();

  const handleBuyerTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setBuyerType(val);
    localStorage.setItem("magro_buyer_subtype", val);
    showToast(`Type d'acheteur mis à jour : ${val}`, "success");
  };

  const handleTogglePremium = () => {
    onNavigate('subscription');
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idDoc) {
      showToast("La pièce d'identité est obligatoire.", "error");
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
      showToast("Votre dossier de vérification a été envoyé pour examen au modérateur MAGRO.", "success");
    } catch (err) {
      showToast("Erreur lors de l'envoi du dossier.", "error");
    }
  };

  const handleRequestDeletion = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir demander la suppression de votre compte ? Cette action sera envoyée à un administrateur pour confirmation.")) {
      try {
        await requestAccountDeletion("Demande utilisateur depuis l'application");
        showToast("Votre demande de suppression a été envoyée. Elle sera traitée par l'administration MAGRO.", "success");
      } catch (err: any) {
        showToast(err.message || "Erreur lors de la demande de suppression.", "error");
      }
    }
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      EN_ATTENTE: "En attente",
      CONFIRMEE: "Confirmée",
      PRETE: "Prête",
      DELIVERED: "Livrée",
      DISPUTED: "En litige",
      CANCELLED: "Annulée"
    };
    return map[status] || status;
  };

  const statusColor = (status: string) => {
    if (status === "DELIVERED" || status === "PRETE") return "bg-green-100 text-green-700";
    if (status === "DISPUTED" || status === "CANCELLED") return "bg-red-100 text-red-700";
    if (status === "CONFIRMEE") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
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
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl mb-4 overflow-hidden">
              {userProfile?.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                getInitials(userName)
              )}
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
              : isAdmin
              ? "Administration MAGRO"
              : "Acheteur"}
            {isPremium && " • Premium ✨"}
          </p>
          {userProfile?.email && <p className="text-white/60 text-xs mt-1">{userProfile.email}</p>}
          {userProfile?.phone && <p className="text-white/60 text-xs">{userProfile.phone.startsWith('google-') ? 'Google Account' : userProfile.phone}</p>}
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
          {/* Subscriptions & Badges */}
          {!isAdmin && (
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
                  {isPremium ? "Gérer l'abonnement" : "S'abonner"}
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
          {!isAdmin && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-muted rounded-2xl p-4 text-center">
                <p className="text-2xl text-primary mb-1">{ordersLoading ? "…" : orders.length}</p>
                <p className="text-xs text-muted-foreground">Commandes</p>
              </div>
              <div className="bg-muted rounded-2xl p-4 text-center">
                <p className="text-2xl text-secondary mb-1">{userProfile?.rating ? Number(userProfile.rating).toFixed(1) : "—"}</p>
                <p className="text-xs text-muted-foreground">Note</p>
              </div>
            </div>
          )}

          {/* Orders History - REAL DATA */}
          {!isAdmin && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg">Mes commandes</h3>
                <button onClick={() => onNavigate('orders')} className="text-sm text-primary cursor-pointer">Voir tout</button>
              </div>

              {ordersLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : ordersError ? (
                <p className="text-center text-xs text-muted-foreground py-4">Impossible de charger les commandes.</p>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-2">
                  <Package className="w-10 h-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Aucune commande pour le moment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="bg-muted rounded-2xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-base mb-1">{order.crop}</h4>
                          <p className="text-sm text-muted-foreground">{order.quantity} kg • {new Date(order.date).toLocaleDateString("fr-FR")}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full ${statusColor(order.status)}`}>
                          {statusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
                    <div 
                      className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => onNavigate('support')}
                    >
                      <HelpCircle className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Aide et Support</p>
                        <p className="text-xs text-muted-foreground">Centre d'aide et FAQ — Contactez le support</p>
                      </div>
                    </div>
                    {/* Suppression de compte - masquée pour les admins */}
                    {!isAdmin && (
                      <div 
                        className="flex items-center gap-3 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100"
                        onClick={handleRequestDeletion}
                      >
                        <X className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-red-600">Supprimer mon compte</p>
                          <p className="text-xs text-red-500">Demander la suppression définitive</p>
                        </div>
                      </div>
                    )}
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
