import { Plus, Package, Bell, Home as HomeIcon, MessageCircle, User, List, Award, FileSpreadsheet, Check, X, BarChart3, Sprout } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { fetchMyContracts, updateContractStatus, SeasonalContract } from "../services/contracts";
import { requestCertification, fetchCertificationRequests, Certification } from "../services/certifications";
import { useUnreadCount } from "../services/chat";
import { useToast } from "../components/ToastProvider";
import MarketInsights from "../components/MarketInsights";
import { getInitials } from "../utils/format";

interface FarmerDashboardMVPProps {
  userName: string;
  onNavigate: (screen: string) => void;
  totalProducts?: number;
}

export default function FarmerDashboardMVP({ userName, onNavigate, totalProducts = 0 }: FarmerDashboardMVPProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const [dashTab, setDashTab] = useState<"home" | "market">("home");
  const [contracts, setContracts] = useState<SeasonalContract[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [showCertDialog, setShowCertDialog] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [certCrop, setCertCrop] = useState("Tomates fraîches");
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const unreadCount = useUnreadCount();

  const stats = [
    { label: "Annonces", value: totalProducts.toString(), color: "text-blue-600" },
    { label: "Certifications", value: certifications.filter(c => c.status === "ACTIVE").length.toString(), color: "text-amber-600" },
    { label: "Contrats", value: contracts.filter(c => c.status === "ACTIVE").length.toString(), color: "text-secondary" }
  ];

  const loadDashboardData = async () => {
    try {
      const myContracts = await fetchMyContracts();
      setContracts(myContracts);
      const myCerts = await fetchCertificationRequests();
      setCertifications(myCerts.filter(c => c.farmerId === "mock-farmer" || c.farmerId === "farmer-1"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAcceptContract = async (id: string) => {
    try {
      await updateContractStatus(id, "ACTIVE");
      showToast("Contrat saisonnier accepté et actif !", "success");
      loadDashboardData();
    } catch (err) {
      showToast("Erreur lors de l'acceptation.", "error");
    }
  };

  const handleRejectContract = async (id: string) => {
    try {
      await updateContractStatus(id, "CANCELLED");
      showToast("Contrat saisonnier refusé.", "info");
      loadDashboardData();
    } catch (err) {
      showToast("Erreur.", "error");
    }
  };

  const handleRequestCert = async () => {
    try {
      await requestCertification(certCrop);
      showToast(`Demande pour ${certCrop} soumise. Frais réglés.`, "success");
      setShowCertDialog(false);
      loadDashboardData();
    } catch (err) {
      showToast("Erreur.", "error");
    }
  };

  return (
    <div className="h-screen bg-muted flex flex-col pb-20">
      {/* Header */}
      <div className="bg-primary text-white px-6 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
              {getInitials(userName)}
            </div>
            <div>
              <h1 className="text-lg font-semibold">Bonjour {userName} 👋</h1>
              <p className="text-white/80 text-sm">Agriculteur Pro</p>
            </div>
          </div>
          <button onClick={() => { setShowNotifications(true); setUnreadNotifications(0); }} className="relative p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
            <Bell className="w-6 h-6" />
            {unreadNotifications > 0 && (
              <span className="absolute top-0 right-0 w-4.5 h-4.5 bg-secondary text-[10px] rounded-full flex items-center justify-center font-bold">
                {unreadNotifications}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 mt-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-xl p-4 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`text-2xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="text-[11px] text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tab switcher: Home / Market Insights */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setDashTab("home")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              dashTab === "home" ? "bg-primary text-white" : "bg-white text-muted-foreground border border-border"
            }`}
          >
            🏠 Tableau de bord
          </button>
          <button
            onClick={() => setDashTab("market")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              dashTab === "market" ? "bg-secondary text-white" : "bg-white text-muted-foreground border border-border"
            }`}
          >
            📈 Marché & Tendances
          </button>
        </div>

        {dashTab === "market" ? (
          <MarketInsights />
        ) : (<>
        
        {/* Analytics Mini-Dashboard */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-border">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-primary" />
              Ventes de la semaine
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <BarChart3 className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-xs text-muted-foreground">Aucune vente enregistrée cette semaine.</p>
            <p className="text-[10px] text-muted-foreground mt-1">Vos statistiques apparaîtront ici après vos premières ventes.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <motion.button
            onClick={() => onNavigate("create-listing")}
            className="bg-secondary hover:bg-secondary/90 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs font-semibold"
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            <span>Publier</span>
          </motion.button>
          <motion.button
            onClick={() => onNavigate("my-listings")}
            className="bg-white border border-border hover:bg-muted text-foreground py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs font-semibold"
            whileTap={{ scale: 0.98 }}
          >
            <List className="w-4 h-4" />
            <span>Mes annonces</span>
          </motion.button>
          <motion.button
            onClick={() => onNavigate("orders")}
            className="bg-white border border-border hover:bg-muted text-foreground py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs font-semibold"
            whileTap={{ scale: 0.98 }}
          >
            <Package className="w-4 h-4" />
            <span>Commandes</span>
          </motion.button>
          <motion.button
            onClick={() => onNavigate("production-planning")}
            className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs font-semibold"
            whileTap={{ scale: 0.98 }}
          >
            <Sprout className="w-4 h-4" />
            <span>Planification</span>
          </motion.button>
        </div>

        {/* Quality Certifications Card Section (CDC Section 6) */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              Certifications Qualité
            </h2>
            <button
              onClick={() => setShowCertDialog(true)}
              className="text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-1.5 rounded-xl font-semibold border border-amber-200"
            >
              Demander badge
            </button>
          </div>

          <div className="space-y-2">
            {certifications.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                Aucune certification demandée pour le moment.
              </p>
            ) : (
              certifications.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <div>
                    <span className="font-semibold text-gray-800">{cert.cropName}</span>
                    {cert.status === "ACTIVE" && (
                      <span className="text-[10px] text-muted-foreground block">
                        Score : {cert.score}/100 • Valide 6 mois
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    cert.status === "ACTIVE" 
                      ? cert.badgeLevel === "GOLD" ? "bg-amber-100 text-amber-800 font-semibold" : "bg-gray-200 text-gray-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {cert.status === "ACTIVE" 
                      ? cert.badgeLevel === "GOLD" ? "🟡 OR Premium" : "⚪ ARGENT"
                      : "⏳ En attente inspection"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Seasonal Contracts Card Section (CDC Section 7.7 for Industry) */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-border">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 mb-4">
            <FileSpreadsheet className="w-4 h-4 text-primary" />
            Contrats Saisonniers Industriels
          </h2>

          <div className="space-y-3">
            {contracts.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                Aucun contrat saisonnier proposé.
              </p>
            ) : (
              contracts.map((contract) => (
                <div key={contract.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{contract.cropName}</h4>
                      <p className="text-[10px] text-muted-foreground">Acheteur : {contract.buyerName}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      contract.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                      contract.status === "CANCELLED" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {contract.status === "PENDING" ? "En attente" : contract.status === "ACTIVE" ? "Actif" : "Refusé"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600 bg-white p-2 rounded-lg border border-gray-100">
                    <div>Quantité : {(contract.totalQuantityKg / 1000).toFixed(1)} t</div>
                    <div>Prix : {contract.pricePerKg} FCFA/kg</div>
                    <div className="col-span-2">Période : {contract.seasonStart} au {contract.seasonEnd}</div>
                  </div>

                  {contract.status === "PENDING" && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleAcceptContract(contract.id)}
                        className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Accepter
                      </button>
                      <button
                        onClick={() => handleRejectContract(contract.id)}
                        className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                      >
                        <X className="w-3 h-3" /> Refuser
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        </>)}
      </div>

      {/* Notifications Dialog */}
      <AnimatePresence>
        {showNotifications && (
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
                <Bell className="w-5 h-5 text-primary" />
                Vos Notifications
              </h3>
              
              <div className="space-y-3 pt-2">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Bell className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-xs text-muted-foreground">Aucune notification pour le moment.</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Vous serez notifié lors de nouvelles commandes ou événements.</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="w-full bg-gray-100 text-gray-700 text-xs py-3 rounded-xl font-bold hover:bg-gray-200 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Certification Dialog Modal (Simulated Payment) */}
      <AnimatePresence>
        {showCertDialog && (
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
              <h3 className="text-lg font-bold text-gray-900">Demander une Certification Qualité</h3>
              <p className="text-xs text-muted-foreground">
                Un technicien CAA/Expert MAGRO se déplacera sur votre parcelle pour valider la conformité de vos récoltes.
              </p>
              
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Culture concernée</label>
                  <select
                    value={certCrop}
                    onChange={(e) => setCertCrop(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Tomates fraîches">Tomates fraîches</option>
                    <option value="Oignons blancs">Oignons blancs</option>
                    <option value="Mangues Kent">Mangues Kent</option>
                  </select>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[11px] text-amber-800">
                  <strong>Frais d'inspection : 15 000 FCFA</strong><br />
                  Le règlement s'effectue de manière sécurisée par Mobile Money (Orange Money / Wave).
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleRequestCert}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs py-3 rounded-xl font-bold transition-colors"
                >
                  Payer & Demander (15k)
                </button>
                <button
                  onClick={() => setShowCertDialog(false)}
                  className="bg-gray-100 text-gray-700 text-xs px-4 py-3 rounded-xl font-bold hover:bg-gray-200"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-4">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "home" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs">Accueil</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("orders");
              onNavigate("orders");
            }}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "orders" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Package className="w-6 h-6" />
            <span className="text-xs">Commandes</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("chat");
              onNavigate("chat");
            }}
            className={`relative flex flex-col items-center gap-1 ${
              activeTab === "chat" ? "text-secondary" : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <MessageCircle className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-xs">Messages</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("profile");
              onNavigate("profile");
            }}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "profile" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profil</span>
          </button>
        </div>
      </div>
    </div>
  );
}
