import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const goOffline = () => {
      setIsOffline(true);
      setShowBanner(true);
    };
    const goOnline = () => {
      setIsOffline(false);
      // Show "back online" briefly
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    // Initial state
    if (!navigator.onLine) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={`fixed top-0 left-0 right-0 z-[100] px-4 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold ${
            isOffline
              ? "bg-amber-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {isOffline ? (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Mode hors ligne — Les données seront synchronisées à la reconnexion</span>
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4" />
              <span>Connexion rétablie ✓</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
