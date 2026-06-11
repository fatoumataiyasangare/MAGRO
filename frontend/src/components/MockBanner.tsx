import { AlertTriangle } from "lucide-react";
import { getConfig } from "../services/config";

export default function MockBanner() {
  const cfg = getConfig();
  
  if (cfg.isApiAvailable && !cfg.mockDataEnabled) {
    return null;
  }

  return (
    <div className="bg-yellow-500 text-black text-xs font-bold px-4 py-2 flex items-center justify-center gap-2 z-50 sticky top-0">
      <AlertTriangle className="w-4 h-4" />
      <span>Mode Hors Ligne / Simulation (Mock Data)</span>
    </div>
  );
}
