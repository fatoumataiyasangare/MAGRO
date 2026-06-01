import { TrendingUp, TrendingDown, Minus, BarChart3, Leaf, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface CropTrend {
  name: string;
  avgPrice: number;
  change: number; // % change
  demandScore: number; // 1-10
  region: string;
  season: "✅ En saison" | "⚠️ Hors saison" | "🔜 Bientôt";
}

const MARKET_DATA: CropTrend[] = [
  { name: "Tomates fraîches", avgPrice: 750, change: +12, demandScore: 9, region: "Sikasso", season: "✅ En saison" },
  { name: "Oignons blancs", avgPrice: 500, change: -5, demandScore: 7, region: "Kayes", season: "✅ En saison" },
  { name: "Mangues Kent", avgPrice: 1200, change: +20, demandScore: 10, region: "Koulikoro", season: "🔜 Bientôt" },
  { name: "Maïs jaune", avgPrice: 200, change: 0, demandScore: 6, region: "Ségou", season: "✅ En saison" },
  { name: "Arachides", avgPrice: 450, change: +8, demandScore: 8, region: "Sikasso", season: "⚠️ Hors saison" },
];

const PRODUCTION_TIPS = [
  { icon: "🌱", title: "Mangues Kent très demandées", desc: "La saison approche. Planifiez vos filets de récolte dès maintenant pour répondre à la demande industrielle." },
  { icon: "📈", title: "Prix tomates en hausse (+12%)", desc: "Opportunité ! Les acheteurs des restaurants Bamako paient plus. Publiez vos annonces cette semaine." },
  { icon: "⚠️", title: "Concurrence sur Oignons", desc: "5 annonces actives à Kayes. Différenciez-vous avec un badge de certification Qualité." },
];

export default function MarketInsights() {
  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">Tendances du Marché</h2>
          <p className="text-[10px] text-muted-foreground">Mise à jour en temps réel • Bamako & régions pilotes</p>
        </div>
      </div>

      {/* Price Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Cours des cultures</span>
          <span className="text-[10px] text-muted-foreground">FCFA/kg</span>
        </div>
        <div className="divide-y divide-gray-50">
          {MARKET_DATA.map((crop, index) => (
            <motion.div
              key={crop.name}
              className="px-4 py-3 flex items-center gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.07 }}
            >
              {/* Trend icon */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                crop.change > 0 ? "bg-green-100" : crop.change < 0 ? "bg-red-100" : "bg-gray-100"
              }`}>
                {crop.change > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                ) : crop.change < 0 ? (
                  <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                ) : (
                  <Minus className="w-3.5 h-3.5 text-gray-500" />
                )}
              </div>

              {/* Crop info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-gray-900 truncate">{crop.name}</span>
                  <span className="text-[10px] text-muted-foreground">{crop.season}</span>
                </div>
                {/* Demand bar */}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${crop.demandScore * 10}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{crop.region}</span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-gray-900">{crop.avgPrice}</div>
                <div className={`text-[10px] font-semibold ${
                  crop.change > 0 ? "text-green-600" : crop.change < 0 ? "text-red-600" : "text-gray-500"
                }`}>
                  {crop.change > 0 ? "+" : ""}{crop.change}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Planning Tips */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-green-600" />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Conseils de planification</span>
        </div>
        <div className="divide-y divide-gray-50">
          {PRODUCTION_TIPS.map((tip, i) => (
            <div key={i} className="px-4 py-3 flex items-start gap-3">
              <span className="text-lg leading-none mt-0.5">{tip.icon}</span>
              <div>
                <p className="text-xs font-semibold text-gray-900">{tip.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-900">Contrat Saisonnier disponible</p>
          <p className="text-[11px] text-amber-800 mt-0.5">
            Grands Moulins du Mali cherche 25 tonnes de tomates pour Août–Novembre. 
            <span className="font-semibold"> Prix garanti : 800 FCFA/kg.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
