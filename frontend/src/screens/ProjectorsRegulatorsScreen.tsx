import { Monitor, Shield, TrendingUp, Users, FileText, BarChart3, Home as HomeIcon, MessageCircle, User, Settings, Award, ShieldAlert, Key, Download, Check, X, FileSpreadsheet } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

function formatPrice(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

// Services frontend
import { fetchVerificationRequests, processVerificationRequest, VerificationRequest } from "../services/verifications";
import { fetchDisputes, resolveDispute, Dispute } from "../services/disputes";
import { fetchCertificationRequests, submitInspectionScore, Certification } from "../services/certifications";

interface ProjectorsRegulatorsScreenProps {
  userName: string;
  onNavigate: (screen: string) => void;
}

export default function ProjectorsRegulatorsScreen({ userName, onNavigate }: ProjectorsRegulatorsScreenProps) {
  const [activeTab, setActiveTab] = useState("home"); // home or monitor
  const [subTab, setSubTab] = useState("verifications"); // verifications, disputes, experts, analyst

  // Data states
  const [verRequests, setVerRequests] = useState<VerificationRequest[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [certRequests, setCertRequests] = useState<Certification[]>([]);

  // Plafond role (simulated: 'MODERATOR' or 'SUPER_ADMIN')
  const [adminRole, setAdminRole] = useState<"MODERATOR" | "SUPER_ADMIN">("MODERATOR");

  // Rejection/Decision modal states
  const [showRejectionInput, setShowRejectionInput] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [disputeDecision, setDisputeDecision] = useState<"FARMER_WINS" | "BUYER_WINS" | "SPLIT" | "PARTIAL_REFUND">("FARMER_WINS");
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
  const [apiKeys, setApiKeys] = useState<{ id: string; name: string; quota: number }[]>([
    { id: "key-1", name: "JICA Mali Tracker", quota: 1000 },
    { id: "key-2", name: "Ministère Agriculture DNA", quota: 5000 }
  ]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyQuota, setNewKeyQuota] = useState(2000);

  const loadData = async () => {
    try {
      const vReqs = await fetchVerificationRequests();
      setVerRequests(vReqs);
      const dis = await fetchDisputes();
      setDisputes(dis);
      const certs = await fetchCertificationRequests();
      setCertRequests(certs);
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
      alert("Demande approuvée. Badge Vert activé pour le producteur.");
      loadData();
    } catch (err) {
      alert("Erreur lors du traitement.");
    }
  };

  const handleRejectVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRejectionInput || !rejectionReason) return;
    try {
      await processVerificationRequest(showRejectionInput, "REJECTED", rejectionReason);
      alert("Demande rejetée. Motif envoyé à l'utilisateur.");
      setShowRejectionInput(null);
      setRejectionReason("");
      loadData();
    } catch (err) {
      alert("Erreur lors du traitement.");
    }
  };

  // Dispute resolution (Arbitration - CDC Plafond 1 000 000 FCFA)
  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute || !disputeNote) {
      alert("Veuillez saisir une note de décision explicative.");
      return;
    }

    // Plafond check (1 000 000 FCFA)
    if (selectedDispute.orderPrice > 1000000 && adminRole !== "SUPER_ADMIN") {
      alert("⚠️ Escalation requise : Les litiges sur des montants supérieurs à 1 000 000 FCFA doivent obligatoirement être tranchés par un Super Administrateur. Veuillez modifier votre profil en Super Admin dans les paramètres simulés.");
      return;
    }

    try {
      await resolveDispute(selectedDispute.id, disputeDecision, disputeRatio, disputeNote);
      alert(`Litige résolu avec succès. Décision : ${disputeDecision}`);
      setSelectedDispute(null);
      setDisputeNote("");
      loadData();
    } catch (err) {
      alert("Erreur lors de la résolution du litige.");
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
      alert(`Score total de ${totalScore}/100 enregistré. Badge ${totalScore >= 80 ? "Or" : "Argent"} attribué avec succès.`);
      setSelectedCert(null);
      loadData();
    } catch (err) {
      alert("Erreur lors de l'enregistrement de l'inspection.");
    }
  };

  // API Key creation
  const handleCreateApiKey = () => {
    if (!newKeyName) return;
    setApiKeys([...apiKeys, { id: "key-" + Date.now(), name: newKeyName, quota: newKeyQuota }]);
    setNewKeyName("");
    alert("Clé API institutionnelle créée.");
  };

  const handleRevokeApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
    alert("Clé API révoquée.");
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
    alert(`Fichier anonymisé exporté au format ${format.toUpperCase()}`);
  };

  const totalVolume = disputes.reduce((sum, d) => sum + d.orderPrice, 0) + 1545000;

  return (
    <div className="h-screen bg-muted flex flex-col pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-2xl font-bold tracking-wide mb-1">MAGRO</p>
            <h1 className="text-lg font-semibold">Bonjour, {userName} 👋</h1>
            
            {/* Simulation controls for Plafond RBAC */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                Profil : {adminRole === "SUPER_ADMIN" ? "Super Admin 👑" : "Modérateur 🛡️"}
              </span>
              <button 
                onClick={() => setAdminRole(adminRole === "SUPER_ADMIN" ? "MODERATOR" : "SUPER_ADMIN")}
                className="text-[9px] underline text-secondary font-semibold hover:text-white"
              >
                (Basculer le rôle)
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 bg-white/20 rounded-lg">
              <Shield className="w-5 h-5" />
            </button>
            <button className="relative p-2 bg-white/20 rounded-lg">
              <Monitor className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-[10px] rounded-full flex items-center justify-center font-bold">
                {verRequests.filter(r => r.status === "PENDING").length + disputes.filter(d => d.status === "NEW").length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content router */}
      <div className="flex-1 overflow-y-auto px-6 pt-4">
        {activeTab === "home" ? (
          /* General Dashboard Home View */
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-3 -mt-10">
              <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between border border-border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Dossiers d'identité en attente (Badge Vert)</div>
                  <div className="text-2xl font-bold text-primary">{verRequests.filter(r => r.status === "PENDING").length}</div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Shield className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between border border-border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Litiges à instruire (Disputes)</div>
                  <div className="text-2xl font-bold text-red-600">{disputes.filter(d => d.status === "NEW").length}</div>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between border border-border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Inspections Qualité requises (Experts CAA)</div>
                  <div className="text-2xl font-bold text-amber-600">{certRequests.filter(c => c.status === "PENDING" || c.status === "SUSPENDED").length}</div>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <Award className="w-6 h-6" />
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
              </div>
            </div>
          </div>
        ) : (
          /* Sub-views admin panel inside Monitor Tab */
          <div className="space-y-4">
            {/* Top Navigation Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
              {[
                { id: "verifications", label: "Badges Verts" },
                { id: "disputes", label: "Litiges" },
                { id: "experts", label: "Inspections (Expert)" },
                { id: "analyst", label: "Statistiques & API" }
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
                          dis.status === "RESOLVED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {dis.status === "RESOLVED" ? "Tranché" : "À instruire"}
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
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-800">Console d'Analyse Institutionnelle</h3>

                {/* KPIs */}
                <div className="bg-white p-4 rounded-xl border border-border space-y-2 text-xs">
                  <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Statistiques plateforme</h4>
                  <div className="grid grid-cols-2 gap-2 text-center pt-1">
                    <div className="bg-muted p-2 rounded-lg">
                      <span className="text-[10px] text-muted-foreground block">Volume total finalisé</span>
                      <strong className="text-sm text-primary">{formatPrice(totalVolume)}</strong>
                    </div>
                    <div className="bg-muted p-2 rounded-lg">
                      <span className="text-[10px] text-muted-foreground block">Badges Or actifs</span>
                      <strong className="text-sm text-amber-600">3</strong>
                    </div>
                  </div>
                </div>

                {/* Institutional Export */}
                <div className="bg-white p-4 rounded-xl border border-border space-y-3 text-xs">
                  <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Export de données anonymisées</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Générez des rapports agrégés des cours et volumes pour le Ministère ou la JICA.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportData("csv")}
                      className="flex-1 bg-muted hover:bg-gray-200 border border-border text-foreground font-bold py-2 rounded-lg flex items-center justify-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                    <button
                      onClick={() => handleExportData("json")}
                      className="flex-1 bg-muted hover:bg-gray-200 border border-border text-foreground font-bold py-2 rounded-lg flex items-center justify-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> JSON
                    </button>
                  </div>
                </div>

                {/* Institutional API Keys */}
                <div className="bg-white p-4 rounded-xl border border-border space-y-3 text-xs">
                  <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Gestion des clés API Partenaires</h4>
                  
                  {/* Create key */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nom du partenaire..."
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="flex-1 p-2 bg-muted rounded-lg text-xs"
                    />
                    <button
                      onClick={handleCreateApiKey}
                      className="bg-primary text-white px-4 py-2 rounded-lg font-bold"
                    >
                      Créer Clé
                    </button>
                  </div>

                  <div className="space-y-2 pt-2">
                    {apiKeys.map(k => (
                      <div key={k.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100 text-[10px]">
                        <div>
                          <strong>{k.name}</strong>
                          <span className="text-muted-foreground block">Quota : {k.quota} req/jour</span>
                        </div>
                        <button
                          onClick={() => handleRevokeApiKey(k.id)}
                          className="text-red-600 font-semibold"
                        >
                          Révoquer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
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
