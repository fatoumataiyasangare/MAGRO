import { Monitor, Shield, TrendingUp, Users, FileText, BarChart3, Home as HomeIcon, MessageCircle, User, Settings, Award, ShieldAlert, Key, Download, Check, X, FileSpreadsheet, Trash2, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { useToast } from "../components/ToastProvider";
import { useUnreadCount } from "../services/chat";
import { apiFetch, getStoredAccessToken } from "../services/api";

function formatPrice(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

// Services frontend
import { fetchVerificationRequests, processVerificationRequest, VerificationRequest } from "../services/verifications";
import { fetchDisputes, resolveDispute, updateDisputeStatus, Dispute } from "../services/disputes";
import { fetchCertificationRequests, submitInspectionScore, Certification } from "../services/certifications";

interface AdminDashboardProps {
  userName: string;
  onNavigate: (screen: string) => void;
  propRole?: "MODERATOR" | "SUPER_ADMIN" | "ANALYST";
  onLogout?: () => void;
}

export default function AdminDashboard({ userName, onNavigate, propRole, onLogout }: AdminDashboardProps) {
  const { showToast } = useToast();
  const unreadCount = useUnreadCount();
  const adminRole = propRole;
  const [activeTab, setActiveTab] = useState("home"); // home or monitor
  const [subTab, setSubTab] = useState(adminRole === "ANALYST" ? "analyst" : "verifications");

  // Data states
  const [verRequests, setVerRequests] = useState<VerificationRequest[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [certRequests, setCertRequests] = useState<Certification[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<any[]>([]);

  // Rejection/Decision modal states
  const [showRejectionInput, setShowRejectionInput] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [disputeDecision, setDisputeDecision] = useState<"FARMER_WINS" | "BUYER_WINS" | "SPLIT" | "PARTIAL_REFUND" | "ESCALATE">("ESCALATE");
  const [disputeRatio, setDisputeRatio] = useState(0.5);
  const [disputeNote, setDisputeNote] = useState("");

  // Expert scoring state
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [scoreAspect, setScoreAspect] = useState(25); // max 30
  const [scoreBrix, setScoreBrix] = useState(20); // max 25
  const [scoreHygiene, setScoreHygiene] = useState(15); // max 20
  const [scorePractices, setScorePractices] = useState(10); // max 15
  const [scoreTrace, setScoreTrace] = useState(8); // max 10

  // API Key state
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyQuota, setNewKeyQuota] = useState(2000);

  const loadData = async () => {
    // Guard: don't make API calls if there's no access token
    if (!getStoredAccessToken()) {
      console.warn("AdminDashboard: no token, skipping data load");
      return;
    }
    try {
      const vReqs = await fetchVerificationRequests();
      setVerRequests(vReqs);
      const dis = await fetchDisputes();
      setDisputes(dis);
      const certs = await fetchCertificationRequests();
      setCertRequests(certs);
      try {
        const realStats = await apiFetch<any>("/admin/stats");
        setStats(realStats);
      } catch {}
      if (adminRole === "SUPER_ADMIN") {
        try {
          const fetchedUsers = await apiFetch<any[]>("/admin/users");
          setAdminUsers(fetchedUsers);
          const fetchedKeys = await apiFetch<any[]>("/admin/api-keys");
          setApiKeys(fetchedKeys);
          const fetchedDeletions = await apiFetch<any[]>("/admin/delete-requests");
          setDeletionRequests(fetchedDeletions);
        } catch {}
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Verification approvals (Vert)
  const handleApproveVerification = async (id: string) => {
    try {
      await processVerificationRequest(id, "APPROVED");
      showToast("Demande approuvée. Badge Vert activé pour le producteur.", "success");
      loadData();
    } catch (err) {
      showToast("Erreur lors du traitement.", "error");
    }
  };

  const handleRejectVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRejectionInput || !rejectionReason) return;
    try {
      await processVerificationRequest(showRejectionInput, "REJECTED", rejectionReason);
      showToast("Demande rejetée. Motif envoyé à l'utilisateur.", "success");
      setShowRejectionInput(null);
      setRejectionReason("");
      loadData();
    } catch (err) {
      showToast("Erreur lors du traitement.", "error");
    }
  };

  // Dispute resolution (Arbitration - CDC Plafond 1 000 000 FCFA)
  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute || !disputeNote) {
      showToast("Veuillez saisir une note de décision explicative.", "error");
      return;
    }

    // Plafond check (1 000 000 FCFA)
    if (selectedDispute.orderPrice > 1000000 && adminRole !== "SUPER_ADMIN") {
      showToast("⚠️ Escalation requise : Les litiges sur des montants supérieurs à 1 000 000 FCFA doivent obligatoirement être tranchés par un Super Administrateur.", "error");
      return;
    }

    try {
      if (disputeDecision === "ESCALATE") {
        await updateDisputeStatus(selectedDispute.id, "IN_REVIEW", disputeNote);
        showToast("Litige transmis à l'autorité compétente au Mali (En attente).", "success");
      } else {
        await resolveDispute(selectedDispute.id, disputeDecision, disputeRatio, disputeNote);
        showToast(`Litige résolu avec succès. Décision : ${disputeDecision}`, "success");
      }
      setSelectedDispute(null);
      setDisputeNote("");
      loadData();
    } catch (err) {
      showToast("Erreur lors de la résolution du litige.", "error");
    }
  };

  // Expert score submission (CDC Grille de scoring)
  const handleCalculateAndSubmitScore = async () => {
    if (!selectedCert) return;
    const totalScore = scoreAspect + scoreBrix + scoreHygiene + scorePractices + scoreTrace;
    try {
      await submitInspectionScore(selectedCert.id, totalScore, {
        aspect: scoreAspect,
        brix: scoreBrix,
        hygiene: scoreHygiene,
        practices: scorePractices,
        traceability: scoreTrace
      });
      showToast(`Score total de ${totalScore}/100 enregistré. Badge ${totalScore >= 80 ? "Or" : "Argent"} attribué avec succès.`, "success");
      setSelectedCert(null);
      loadData();
    } catch (err) {
      showToast("Erreur lors de l'enregistrement de l'inspection.", "error");
    }
  };

  const handleSuspendUser = async (id: string, currentlySuspended: boolean) => {
    try {
      await apiFetch(`/admin/users/${id}/suspend`, {
        method: "PATCH",
        body: JSON.stringify({ suspend: !currentlySuspended })
      });
      showToast(currentlySuspended ? "Utilisateur débloqué avec succès." : "Utilisateur bloqué avec succès.", "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Erreur lors du traitement.", "error");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur DÉFINITIVEMENT ?")) {
      try {
        await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
        showToast("Utilisateur supprimé avec succès.", "success");
        loadData();
      } catch (err: any) {
        showToast(err.message || "Impossible de supprimer l'utilisateur.", "error");
      }
    }
  };

  const handleApproveDeletion = async (id: string) => {
    if (window.confirm("Êtes-vous sûr ? Cette action supprimera DÉFINITIVEMENT l'utilisateur et ses données.")) {
      try {
        await apiFetch(`/admin/delete-requests/${id}/approve`, {
          method: "PATCH",
          body: JSON.stringify({ status: "APPROVED" })
        });
        showToast("Compte supprimé avec succès.", "success");
        loadData();
      } catch (err: any) {
        showToast(err.message || "Erreur lors de la suppression.", "error");
      }
    }
  };

  const handleRejectDeletion = async (id: string) => {
    try {
      await apiFetch(`/admin/delete-requests/${id}/approve`, {
        method: "PATCH",
        body: JSON.stringify({ status: "REJECTED" })
      });
      showToast("Demande de suppression rejetée.", "success");
      loadData();
    } catch (err) {
      showToast("Erreur lors du rejet.", "error");
    }
  };

  // API Key creation
  const handleCreateApiKey = () => {
    if (!newKeyName) return;
    setApiKeys([...apiKeys, { id: "key-" + Date.now(), name: newKeyName, quota: newKeyQuota }]);
    setNewKeyName("");
    showToast("Clé API institutionnelle créée.", "success");
  };

  const handleRevokeApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
    showToast("Clé API révoquée.", "success");
  };

  // Data CSV export simulator
  const handleExportData = (format: "csv" | "json") => {
    const dataStr = JSON.stringify({
      prices_avg: { tomates: 750, oignons: 500, mangues: 1200 },
      regions_pilotes: ["Sikasso", "Koulikoro", "Ségou", "Kayes", "Bamako"],
      export_date: new Date().toISOString()
    });
    
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `magro_export_institutionnel_${Date.now()}.${format}`;
    link.click();
    showToast(`Fichier anonymisé exporté au format ${format.toUpperCase()}`, "success");
  };

  const totalVolume = disputes.reduce((sum, d) => sum + d.orderPrice, 0);

  return (
    <div className="h-full bg-muted flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-6 pb-6 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xl font-bold tracking-wide">MAGRO</p>
            <h1 className="text-base font-semibold">Bonjour, {userName} 👋</h1>
            
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
              {adminRole === "SUPER_ADMIN" ? "👑 Super Admin" : adminRole === "ANALYST" ? "📊 Analyste" : "🛡️ Modérateur"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setActiveTab("monitor"); setSubTab("verifications"); }}
              className="relative p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Shield className="w-4 h-4" />
            </button>
            <button 
              onClick={() => { setActiveTab("monitor"); setSubTab("disputes"); }}
              className="relative p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Monitor className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-[9px] rounded-full flex items-center justify-center font-bold">
                {verRequests.filter(r => r.status === "PENDING").length + disputes.filter(d => d.status === "NEW").length}
              </span>
            </button>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="relative p-2 bg-red-500/80 rounded-lg hover:bg-red-600 transition-colors ml-2"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content router */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-32">
        {activeTab === "home" ? (
          /* General Dashboard Home View */
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between border border-border">
                <div>
                  <div className="text-[11px] text-muted-foreground mb-1">Dossiers d'identité en attente</div>
                  <div className="text-xl font-bold text-primary">{verRequests.filter(r => r.status === "PENDING").length}</div>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Shield className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between border border-border">
                <div>
                  <div className="text-[11px] text-muted-foreground mb-1">Litiges à instruire</div>
                  <div className="text-xl font-bold text-red-600">{disputes.filter(d => d.status === "NEW").length}</div>
                </div>
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between border border-border">
                <div>
                  <div className="text-[11px] text-muted-foreground mb-1">Inspections Qualité requises</div>
                  <div className="text-xl font-bold text-amber-600">{certRequests.filter(c => c.status === "PENDING" || c.status === "SUSPENDED").length}</div>
                </div>
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <Award className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Quick action grid (switches to controller sub-tabs) */}
            <div>
              <h2 className="text-base font-bold text-gray-800 mb-3">Outils de Régulation</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setActiveTab("monitor"); setSubTab("verifications"); }}
                  className="bg-white p-4 rounded-xl text-center border border-border flex flex-col items-center gap-1.5"
                >
                  <Shield className="w-6 h-6 text-green-600" />
                  <span className="text-xs font-semibold">Badge Vert</span>
                </button>

                <button
                  onClick={() => { setActiveTab("monitor"); setSubTab("disputes"); }}
                  className="bg-white p-4 rounded-xl text-center border border-border flex flex-col items-center gap-1.5"
                >
                  <ShieldAlert className="w-6 h-6 text-red-600" />
                  <span className="text-xs font-semibold">Litiges</span>
                </button>

                <button
                  onClick={() => { setActiveTab("monitor"); setSubTab("experts"); }}
                  className="bg-white p-4 rounded-xl text-center border border-border flex flex-col items-center gap-1.5"
                >
                  <Award className="w-6 h-6 text-amber-600" />
                  <span className="text-xs font-semibold">Notation Expert</span>
                </button>

                <button
                  onClick={() => { setActiveTab("monitor"); setSubTab("analyst"); }}
                  className="bg-white p-4 rounded-xl text-center border border-border flex flex-col items-center gap-1.5"
                >
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  <span className="text-xs font-semibold">Analyste / Clés</span>
                </button>

                {adminRole === "SUPER_ADMIN" && (
                  <button
                    onClick={() => { setActiveTab("monitor"); setSubTab("users"); }}
                    className="bg-white p-4 rounded-xl text-center border border-border flex flex-col items-center gap-1.5"
                  >
                    <Users className="w-6 h-6 text-purple-600" />
                    <span className="text-xs font-semibold">Utilisateurs</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Sub-views admin panel inside Monitor Tab */
          <div className="space-y-4">
            {/* Top Navigation Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
              {[
                ...(adminRole !== "ANALYST" ? [
                  { id: "verifications", label: "Badges Verts" },
                  { id: "disputes", label: "Litiges" },
                  { id: "experts", label: "Inspections (Expert)" },
                ] : []),
                ...(adminRole === "SUPER_ADMIN" ? [
                  { id: "users", label: "Utilisateurs" }
                ] : []),
                { id: "analyst", label: "Statistiques & API" },
                { id: "deletions", label: "Suppressions" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id)}
                  className={`text-xs font-semibold px-4 py-2 border-b-2 transition-colors ${
                    subTab === tab.id ? "border-primary text-primary" : "border-transparent text-gray-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 1. Identity verifications panel */}
            {subTab === "verifications" && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">Dossiers d'identité (Badge Vert)</h3>
                
                {verRequests.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4 bg-white rounded-xl">Aucune demande reçue.</p>
                ) : (
                  verRequests.map((req) => (
                    <div key={req.id} className="bg-white p-4 rounded-xl border border-border space-y-3 text-xs">
                      <div className="flex justify-between">
                        <div>
                          <strong className="text-gray-900 block">{req.userName}</strong>
                          <span className="text-muted-foreground text-[10px]">Role : {req.userRole}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          req.status === "APPROVED" ? "bg-green-100 text-green-800" :
                          req.status === "REJECTED" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="bg-muted p-2 rounded-lg space-y-1 text-[11px]">
                        <div><strong>Pièce ID :</strong> {req.documents.identityCardUrl}</div>
                        {req.documents.gpsCoordinates && (
                          <div><strong>Coordonnées GPS :</strong> {req.documents.gpsCoordinates}</div>
                        )}
                        {req.documents.tradeRegistryUrl && (
                          <div><strong>Registre Commerce :</strong> {req.documents.tradeRegistryUrl}</div>
                        )}
                      </div>

                      {req.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveVerification(req.id)}
                            className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Approuver
                          </button>
                          <button
                            onClick={() => setShowRejectionInput(req.id)}
                            className="bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg font-bold hover:bg-red-100 flex items-center justify-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Rejeter
                          </button>
                        </div>
                      )}

                      {/* Rejection input box */}
                      {showRejectionInput === req.id && (
                        <form onSubmit={handleRejectVerification} className="pt-2 border-t border-gray-100 space-y-2">
                          <textarea
                            placeholder="Motif obligatoire de rejet..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            required
                            className="w-full text-xs p-2 bg-red-50/50 border border-red-200 rounded-lg"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button type="submit" className="bg-red-600 text-white font-bold py-1.5 px-3 rounded-lg text-[10px]">
                              Confirmer le Rejet
                            </button>
                            <button type="button" onClick={() => setShowRejectionInput(null)} className="text-gray-500 bg-gray-100 py-1.5 px-3 rounded-lg text-[10px]">
                              Annuler
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 2. Disputes Arbitrage panel */}
            {subTab === "disputes" && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">Arbitrage des Litiges</h3>
                
                {disputes.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4 bg-white rounded-xl">Aucun litige actif.</p>
                ) : (
                  disputes.map((dis) => (
                    <div key={dis.id} className="bg-white p-4 rounded-xl border border-border space-y-3 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-gray-900 block">{dis.cropName}</strong>
                          <span className="text-muted-foreground text-[10px]">Acheteur : {dis.buyerName}</span>
                        </div>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                          dis.status === "RESOLVED" ? "bg-green-100 text-green-800" : 
                          dis.status === "IN_REVIEW" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {dis.status === "RESOLVED" ? "Tranché" : 
                           dis.status === "IN_REVIEW" ? "En Autorité" : "À instruire"}
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-600 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        "{dis.reason}"
                      </div>

                      <div className="flex justify-between text-[11px] font-semibold">
                        <span>Montant bloqué :</span>
                        <span className="text-primary">{formatPrice(dis.orderPrice)}</span>
                      </div>

                      {dis.status !== "RESOLVED" && (
                        <button
                          onClick={() => setSelectedDispute(dis)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-xs"
                        >
                          Trancher le litige
                        </button>
                      )}

                      {dis.status === "RESOLVED" && (
                        <div className="pt-2 border-t border-gray-100 text-[10px] text-gray-500">
                          <strong>Décision :</strong> {dis.adminDecision} • <strong>Motif :</strong> {dis.decisionNote}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. Expert inspections scoring grid */}
            {subTab === "experts" && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">Notation Expert & Attributions Badges</h3>
                
                {certRequests.filter(c => c.status === "PENDING" || c.status === "SUSPENDED").length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4 bg-white rounded-xl">Aucune inspection demandée.</p>
                ) : (
                  certRequests.filter(c => c.status === "PENDING" || c.status === "SUSPENDED").map((cert) => (
                    <div key={cert.id} className="bg-white p-4 rounded-xl border border-border space-y-3 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-gray-900 block">{cert.cropName}</strong>
                          <span className="text-muted-foreground text-[10px]">Région pilote : Koulikoro / Bamako</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-semibold">
                          Inspection requise
                        </span>
                      </div>
                      
                      <button
                        onClick={() => setSelectedCert(cert)}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-lg text-xs"
                      >
                        Saisir la grille de score
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 4. Analyst KPI, Exports, Keys */}
            {subTab === "analyst" && (
              <div className="space-y-4 pb-4">
                <h3 className="text-sm font-semibold text-gray-800">Console d'Analyse & Comptabilité</h3>

                {/* Live KPI Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Volume Séquestré", value: formatPrice(totalVolume), color: "text-primary", bg: "bg-blue-50", icon: "🔒" },
                    { label: "Commissions prélevées", value: formatPrice(Math.round(totalVolume * 0.02)), color: "text-green-700", bg: "bg-green-50", icon: "💰" },
                    { label: "Litiges résolus", value: `${disputes.filter(d => d.status === "RESOLVED").length}/${disputes.length}`, color: "text-amber-700", bg: "bg-amber-50", icon: "⚖️" },
                    { label: "Badges Or/Argent actifs", value: certRequests.filter(c => c.status === "ACTIVE").length.toString(), color: "text-amber-600", bg: "bg-amber-50", icon: "🟡" },
                  ].map(kpi => (
                    <div key={kpi.label} className={`${kpi.bg} rounded-xl p-3 border border-white shadow-sm`}>
                      <div className="text-lg mb-0.5">{kpi.icon}</div>
                      <div className={`text-sm font-bold ${kpi.color}`}>{kpi.value}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</div>
                    </div>
                  ))}
                </div>

                {/* Digital Accounting Ledger */}
                <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm text-xs">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">📒 Livre de Compte Digital</h4>
                    <span className="text-[10px] text-green-600 font-semibold">● En direct</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    <div className="px-4 py-6 text-center text-muted-foreground text-xs">
                      Aucune transaction récente enregistrée dans le grand livre.
                    </div>
                  </div>
                </div>

                 {/* Market Stats — for JICA / DNA */}
                <div className="bg-white p-4 rounded-xl border border-border space-y-3 text-xs shadow-sm">
                  <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">📊 Statistiques Marché (Partenaires)</h4>
                  <div className="text-center py-4 text-muted-foreground text-xs">
                    Aucune donnée statistique disponible pour le moment.
                  </div>
                </div>

                {/* Institutional Export */}
                <div className="bg-white p-4 rounded-xl border border-border space-y-3 text-xs shadow-sm">
                  <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">📤 Export de données</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Générez des rapports agrégés et anonymisés pour le Ministère de l'Agriculture ou la JICA.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportData("csv")}
                      className="flex-1 bg-muted hover:bg-gray-200 border border-border text-foreground font-bold py-2.5 rounded-lg flex items-center justify-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                    <button
                      onClick={() => handleExportData("json")}
                      className="flex-1 bg-muted hover:bg-gray-200 border border-border text-foreground font-bold py-2.5 rounded-lg flex items-center justify-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> JSON
                    </button>
                  </div>
                </div>

                {/* Institutional API Keys */}
                <div className="bg-white p-4 rounded-xl border border-border space-y-3 text-xs shadow-sm">
                  <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">🔑 Clés API Institutionnelles</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nom du partenaire..."
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="flex-1 p-2 bg-muted rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={handleCreateApiKey}
                      className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary/90"
                    >
                      Créer
                    </button>
                  </div>
                  <div className="space-y-2">
                    {apiKeys.map(k => (
                      <div key={k.id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <div>
                          <strong className="text-gray-900">{k.name}</strong>
                          <span className="text-muted-foreground block text-[10px]">Quota : {k.quota} req/jour</span>
                        </div>
                        <button
                          onClick={() => handleRevokeApiKey(k.id)}
                          className="text-red-600 font-semibold text-[10px] bg-red-50 px-2 py-1 rounded-lg hover:bg-red-100"
                        >
                          Révoquer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. Deletion Requests panel */}
            {subTab === "deletions" && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">Demandes de suppression de compte</h3>
                
                {deletionRequests.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4 bg-white rounded-xl">Aucune demande de suppression.</p>
                ) : (
                  deletionRequests.map((req) => (
                    <div key={req.id} className="bg-white p-4 rounded-xl border border-border space-y-3 text-xs shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-gray-900 block">{req.user?.name}</strong>
                          <span className="text-muted-foreground text-[10px]">Téléphone: {req.user?.phone} • Rôle: {req.user?.role}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          req.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                          req.status === "APPROVED" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      
                      {req.reason && (
                        <div className="text-[11px] text-gray-600 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          "Motif: {req.reason}"
                        </div>
                      )}

                      {req.status === "PENDING" && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleApproveDeletion(req.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Confirmer (Irréversible)
                          </button>
                          <button
                            onClick={() => handleRejectDeletion(req.id)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg"
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 6. Users Management panel (Super Admin only) */}
            {subTab === "users" && adminRole === "SUPER_ADMIN" && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">Gestion des Utilisateurs</h3>
                
                {adminUsers.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4 bg-white rounded-xl">Aucun utilisateur trouvé.</p>
                ) : (
                  adminUsers.map((u) => {
                    const isSuspended = u.suspensionUntil != null;
                    return (
                      <div key={u.id} className="bg-white p-4 rounded-xl border border-border space-y-3 text-xs shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-gray-900 block text-sm">{u.name}</strong>
                            <span className="text-muted-foreground text-[11px] block mt-0.5">Téléphone: {u.phone}</span>
                            <span className="text-muted-foreground text-[11px] block">Rôle: <span className="font-semibold text-primary">{u.role}</span></span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isSuspended ? "bg-red-100 text-red-800" :
                            u.isVerified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {isSuspended ? "Bloqué" : u.isVerified ? "Vérifié" : "Non vérifié"}
                          </span>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          {/* Protect Super Admins from being modified */}
                          {u.role === "SUPER_ADMIN" ? (
                            <div className="w-full text-center text-muted-foreground italic text-[10px]">
                              Compte administrateur protégé
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => handleSuspendUser(u.id, isSuspended)}
                                className={`flex-1 font-bold py-2 rounded-lg transition-colors ${
                                  isSuspended 
                                  ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200" 
                                  : "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
                                }`}
                              >
                                {isSuspended ? "Débloquer" : "Bloquer"}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Supprimer
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dispute Resolution Arbitrate Dialogue Modal */}
      <AnimatePresence>
        {selectedDispute && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-xl text-xs"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <h3 className="text-base font-bold text-gray-900">Trancher le litige #{selectedDispute.id.slice(0, 8)}</h3>
              
              <div className="bg-red-50 text-red-800 p-2.5 rounded-xl border border-red-100 text-[11px] mb-2">
                <strong>Montant du Litige :</strong> {formatPrice(selectedDispute.orderPrice)}<br />
                {selectedDispute.orderPrice > 1000000 && (
                  <span className="font-semibold text-red-900">⚠️ Supérieur au plafond de 1M. SUPER ADMIN requis.</span>
                )}
              </div>

              <form onSubmit={handleResolveDispute} className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Décision</label>
                  <select
                    value={disputeDecision}
                    onChange={(e) => setDisputeDecision(e.target.value as any)}
                    className="w-full p-2 bg-gray-50 border rounded-lg"
                  >
                    <option value="ESCALATE">Transmettre à l'autorité compétente (Mali)</option>
                    <option value="FARMER_WINS">Donner gain au producteur (Libérer fonds)</option>
                    <option value="BUYER_WINS">Rembourser l'acheteur</option>
                    <option value="SPLIT">Partage proportionnel (Split)</option>
                    <option value="PARTIAL_REFUND">Remboursement partiel</option>
                  </select>
                </div>

                {(disputeDecision === "SPLIT" || disputeDecision === "PARTIAL_REFUND") && (
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Ratio Vendeur : {Math.round(disputeRatio * 100)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={disputeRatio}
                      onChange={(e) => setDisputeRatio(parseFloat(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Note de décision obligatoire</label>
                  <textarea
                    placeholder="Saisissez les motifs légaux/qualité de la décision..."
                    value={disputeNote}
                    onChange={(e) => setDisputeNote(e.target.value)}
                    required
                    rows={3}
                    className="w-full p-2 bg-gray-50 border rounded-lg"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-lg">
                    Rendre la décision
                  </button>
                  <button type="button" onClick={() => setSelectedDispute(null)} className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg">
                    Fermer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expert Inspection scoring Grid Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-xl text-xs"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <h3 className="text-base font-bold text-gray-900">Grille d'évaluation CAA : {selectedCert.cropName}</h3>
              
              <div className="space-y-3 pt-2">
                {/* Aspect 30 */}
                <div>
                  <div className="flex justify-between font-semibold mb-0.5">
                    <span>Aspect Visuel (calibre, couleur) :</span>
                    <span className="text-primary">{scoreAspect} / 30</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={scoreAspect}
                    onChange={(e) => setScoreAspect(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Brix 25 */}
                <div>
                  <div className="flex justify-between font-semibold mb-0.5">
                    <span>Taux de Brix (maturité/sucre) :</span>
                    <span className="text-primary">{scoreBrix} / 25</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={scoreBrix}
                    onChange={(e) => setScoreBrix(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Hygiene 20 */}
                <div>
                  <div className="flex justify-between font-semibold mb-0.5">
                    <span>Conditions Stockage & Hygiène :</span>
                    <span className="text-primary">{scoreHygiene} / 20</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={scoreHygiene}
                    onChange={(e) => setScoreHygiene(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Practices 15 */}
                <div>
                  <div className="flex justify-between font-semibold mb-0.5">
                    <span>Pratiques culturales (pesticides, eau) :</span>
                    <span className="text-primary">{scorePractices} / 15</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={scorePractices}
                    onChange={(e) => setScorePractices(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Traceability 10 */}
                <div>
                  <div className="flex justify-between font-semibold mb-0.5">
                    <span>Régistre de culture & traçabilité :</span>
                    <span className="text-primary">{scoreTrace} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={scoreTrace}
                    onChange={(e) => setScoreTrace(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center text-xs">
                  Score global calculé : <strong>{scoreAspect + scoreBrix + scoreHygiene + scorePractices + scoreTrace} / 100</strong><br />
                  Badge : <span className="font-bold text-amber-700">{scoreAspect + scoreBrix + scoreHygiene + scorePractices + scoreTrace >= 80 ? "🟡 OR Premium" : "⚪ ARGENT"}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCalculateAndSubmitScore}
                  className="flex-1 bg-amber-500 text-white font-bold py-2.5 rounded-lg"
                >
                  Attribuer le badge
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg"
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
            onClick={() => setActiveTab("monitor")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "monitor" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Monitor className="w-6 h-6" />
            <span className="text-xs">Contrôle</span>
          </button>
          <button
            onClick={() => {
              onNavigate("chat");
            }}
            className="flex flex-col items-center gap-1 text-muted-foreground"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs">Messages</span>
          </button>
          <button
            onClick={() => {
              onNavigate("profile");
            }}
            className="flex flex-col items-center gap-1 text-muted-foreground"
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profil</span>
          </button>
        </div>
      </div>
    </div>
  );
}
