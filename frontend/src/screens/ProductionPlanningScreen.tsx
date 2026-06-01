import { useState } from "react";
import { ArrowLeft, Plus, Sprout, Sun, Scissors, CalendarDays, TrendingUp, Trash2, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProductionPlanningScreenProps {
  onBack: () => void;
}

interface CropPlan {
  id: string;
  cropName: string;
  variety: string;
  parcelName: string;
  surfaceHa: number;
  estimatedYieldKg: number;
  semisDate: string;
  harvestDate: string;
  notes: string;
}

const PHASES = [
  { key: "semis", label: "Semis", icon: Sprout, color: "text-green-600", bg: "bg-green-100" },
  { key: "croissance", label: "Croissance", icon: Sun, color: "text-amber-600", bg: "bg-amber-100" },
  { key: "recolte", label: "Récolte", icon: Scissors, color: "text-red-600", bg: "bg-red-100" },
];

const CROPS = [
  "Tomates", "Oignons", "Mangues", "Pommes de terre", "Maïs",
  "Riz paddy", "Mil", "Sorgho", "Arachide", "Coton"
];

function getPhase(plan: CropPlan): number {
  const now = new Date();
  const semis = new Date(plan.semisDate);
  const harvest = new Date(plan.harvestDate);
  if (now < semis) return -1; // pas encore commencé
  const totalDays = (harvest.getTime() - semis.getTime()) / (1000 * 60 * 60 * 24);
  const elapsed = (now.getTime() - semis.getTime()) / (1000 * 60 * 60 * 24);
  const progress = elapsed / totalDays;
  if (progress < 0.3) return 0; // semis
  if (progress < 0.75) return 1; // croissance
  return 2; // récolte
}

function getProgress(plan: CropPlan): number {
  const now = new Date();
  const semis = new Date(plan.semisDate);
  const harvest = new Date(plan.harvestDate);
  if (now < semis) return 0;
  if (now > harvest) return 100;
  const totalMs = harvest.getTime() - semis.getTime();
  const elapsedMs = now.getTime() - semis.getTime();
  return Math.round((elapsedMs / totalMs) * 100);
}

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const STORAGE_KEY = "magro_crop_plans";

function loadPlans(): CropPlan[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  // Default mock data
  const defaults: CropPlan[] = [
    {
      id: "plan-1",
      cropName: "Tomates",
      variety: "Roma VF",
      parcelName: "Parcelle Nord",
      surfaceHa: 2,
      estimatedYieldKg: 8000,
      semisDate: "2026-05-01",
      harvestDate: "2026-08-15",
      notes: "Arrosage goutte-à-goutte installé"
    },
    {
      id: "plan-2",
      cropName: "Oignons",
      variety: "Violet de Galmi",
      parcelName: "Parcelle Est",
      surfaceHa: 1.5,
      estimatedYieldKg: 6000,
      semisDate: "2026-06-10",
      harvestDate: "2026-10-20",
      notes: "Rotation après arachide"
    },
    {
      id: "plan-3",
      cropName: "Mangues",
      variety: "Kent",
      parcelName: "Verger principal",
      surfaceHa: 3,
      estimatedYieldKg: 12000,
      semisDate: "2026-03-01",
      harvestDate: "2026-07-01",
      notes: "Contrat saisonnier avec Bramali SA"
    }
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

function savePlans(plans: CropPlan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export default function ProductionPlanningScreen({ onBack }: ProductionPlanningScreenProps) {
  const [plans, setPlans] = useState<CropPlan[]>(loadPlans);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [cropName, setCropName] = useState("Tomates");
  const [variety, setVariety] = useState("");
  const [parcelName, setParcelName] = useState("");
  const [surfaceHa, setSurfaceHa] = useState("");
  const [estimatedYieldKg, setEstimatedYieldKg] = useState("");
  const [semisDate, setSemisDate] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!variety || !parcelName || !surfaceHa || !semisDate || !harvestDate) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const newPlan: CropPlan = {
      id: "plan-" + Date.now(),
      cropName,
      variety,
      parcelName,
      surfaceHa: parseFloat(surfaceHa),
      estimatedYieldKg: parseInt(estimatedYieldKg) || 0,
      semisDate,
      harvestDate,
      notes
    };
    const updated = [...plans, newPlan];
    setPlans(updated);
    savePlans(updated);
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setCropName("Tomates");
    setVariety("");
    setParcelName("");
    setSurfaceHa("");
    setEstimatedYieldKg("");
    setSemisDate("");
    setHarvestDate("");
    setNotes("");
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer cette planification ?")) return;
    const updated = plans.filter(p => p.id !== id);
    setPlans(updated);
    savePlans(updated);
  };

  // Summary stats
  const totalSurface = plans.reduce((sum, p) => sum + p.surfaceHa, 0);
  const totalYield = plans.reduce((sum, p) => sum + p.estimatedYieldKg, 0);
  const activePlans = plans.filter(p => {
    const progress = getProgress(p);
    return progress > 0 && progress < 100;
  });

  return (
    <div className="h-screen bg-muted flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white px-6 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Planification des Récoltes</h1>
            <p className="text-white/80 text-xs">Prévoyez et suivez vos saisons</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-xl font-bold">{plans.length}</p>
            <p className="text-[10px] text-white/80">Cultures</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-xl font-bold">{totalSurface.toFixed(1)}</p>
            <p className="text-[10px] text-white/80">Hectares</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-xl font-bold">{(totalYield / 1000).toFixed(0)}t</p>
            <p className="text-[10px] text-white/80">Estimation</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 -mt-3">
        {/* Active seasons visual timeline */}
        {activePlans.length > 0 && (
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-border">
            <h2 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-3">
              <CalendarDays className="w-4 h-4 text-green-600" />
              Saisons en cours
            </h2>
            <div className="space-y-3">
              {activePlans.map((plan) => {
                const phase = getPhase(plan);
                const progress = getProgress(plan);
                const currentPhase = PHASES[Math.max(0, Math.min(phase, 2))];
                const PhaseIcon = currentPhase.icon;
                return (
                  <div key={plan.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full ${currentPhase.bg} flex items-center justify-center`}>
                          <PhaseIcon className={`w-3.5 h-3.5 ${currentPhase.color}`} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{plan.cropName} — {plan.variety}</p>
                          <p className="text-[10px] text-muted-foreground">{currentPhase.label} • {plan.parcelName}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        {progress}%
                      </span>
                    </div>
                    {/* Progress bar with phase markers */}
                    <div className="relative">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-green-500 via-amber-400 to-red-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      {/* Phase dots */}
                      <div className="flex justify-between mt-1">
                        {PHASES.map((p, i) => (
                          <span key={p.key} className={`text-[8px] ${i <= phase ? p.color : "text-gray-300"} font-medium`}>
                            {p.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All crop plans */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <Leaf className="w-4 h-4 text-green-600" />
            Mes planifications ({plans.length})
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-xs font-semibold bg-green-600 text-white px-3 py-2 rounded-xl hover:bg-green-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </button>
        </div>

        <div className="space-y-3">
          {plans.map((plan, index) => {
            const phase = getPhase(plan);
            const progress = getProgress(plan);
            const isExpanded = expandedId === plan.id;
            const harvestDays = daysUntil(plan.harvestDate);
            const currentPhase = PHASES[Math.max(0, Math.min(phase, 2))];

            return (
              <motion.div
                key={plan.id}
                className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : plan.id)}
                  className="w-full p-4 text-left cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${currentPhase.bg} flex items-center justify-center mt-0.5`}>
                        {(() => { const Icon = currentPhase.icon; return <Icon className={`w-5 h-5 ${currentPhase.color}`} />; })()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{plan.cropName}</h3>
                        <p className="text-[11px] text-muted-foreground">{plan.variety} • {plan.parcelName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            {plan.surfaceHa} ha
                          </span>
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            {(plan.estimatedYieldKg / 1000).toFixed(1)} tonnes
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {progress >= 100 ? (
                        <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">
                          ✅ Récolté
                        </span>
                      ) : progress === 0 ? (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          ⏳ Dans {daysUntil(plan.semisDate)}j
                        </span>
                      ) : (
                        <span className={`text-[10px] ${currentPhase.bg} ${currentPhase.color} px-2 py-0.5 rounded-full font-bold`}>
                          {currentPhase.label}
                        </span>
                      )}
                      {harvestDays > 0 && progress < 100 && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Récolte dans {harvestDays}j
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mini progress bar */}
                  {progress > 0 && progress < 100 && (
                    <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-green-500 via-amber-400 to-red-400 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border overflow-hidden"
                    >
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-muted-foreground text-[10px]">Date de semis</p>
                            <p className="font-semibold text-gray-900">{new Date(plan.semisDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-muted-foreground text-[10px]">Date de récolte</p>
                            <p className="font-semibold text-gray-900">{new Date(plan.harvestDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-muted-foreground text-[10px]">Surface cultivée</p>
                            <p className="font-semibold text-gray-900">{plan.surfaceHa} hectares</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-muted-foreground text-[10px]">Rendement estimé</p>
                            <p className="font-semibold text-gray-900">{new Intl.NumberFormat("fr-FR").format(plan.estimatedYieldKg)} kg</p>
                          </div>
                        </div>

                        {plan.notes && (
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                            <p className="text-[10px] text-blue-700 font-semibold mb-0.5">Notes</p>
                            <p className="text-xs text-blue-900">{plan.notes}</p>
                          </div>
                        )}

                        {/* Estimated revenue */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <div>
                              <p className="text-[10px] text-green-700 font-semibold">Revenu estimé</p>
                              <p className="text-xs font-bold text-green-900">
                                {new Intl.NumberFormat("fr-FR").format(plan.estimatedYieldKg * 750)} FCFA
                              </p>
                            </div>
                          </div>
                          <p className="text-[10px] text-green-600">@ 750 FCFA/kg</p>
                        </div>

                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="w-full flex items-center justify-center gap-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 py-2.5 rounded-xl font-semibold transition-colors cursor-pointer border border-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Supprimer cette planification
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {plans.length === 0 && (
          <div className="text-center py-12">
            <Sprout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune planification de récolte.</p>
            <p className="text-xs text-muted-foreground mt-1">Ajoutez votre première saison !</p>
          </div>
        )}
      </div>

      {/* Add Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="bg-white w-full max-w-md rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-green-600" />
                Nouvelle planification
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Culture *</label>
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Variété *</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="Ex: Roma VF, Violet de Galmi..."
                    className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Parcelle *</label>
                    <input
                      type="text"
                      value={parcelName}
                      onChange={(e) => setParcelName(e.target.value)}
                      placeholder="Ex: Parcelle Nord"
                      className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Surface (ha) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={surfaceHa}
                      onChange={(e) => setSurfaceHa(e.target.value)}
                      placeholder="Ex: 2.5"
                      className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Rendement estimé (kg)</label>
                  <input
                    type="number"
                    value={estimatedYieldKg}
                    onChange={(e) => setEstimatedYieldKg(e.target.value)}
                    placeholder="Ex: 8000"
                    className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Date de semis *</label>
                    <input
                      type="date"
                      value={semisDate}
                      onChange={(e) => setSemisDate(e.target.value)}
                      className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Date récolte *</label>
                    <input
                      type="date"
                      value={harvestDate}
                      onChange={(e) => setHarvestDate(e.target.value)}
                      className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Informations complémentaires..."
                    rows={2}
                    className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-3.5 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); resetForm(); }}
                    className="bg-gray-100 text-gray-700 text-sm px-5 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
