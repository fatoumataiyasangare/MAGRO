import { motion } from "motion/react";
import { Bell } from "lucide-react";

interface NotificationPermissionScreenProps {
  onAllow: () => void;
  onSkip: () => void;
}

export default function NotificationPermissionScreen({ onAllow, onSkip }: NotificationPermissionScreenProps) {
  return (
    <div className="h-screen bg-muted flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-32 h-32 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Bell className="w-16 h-16 text-secondary" />
          </motion.div>

          <h2 className="text-2xl mb-3">Restez informé</h2>
          <p className="text-muted-foreground mb-12 px-4">
            Recevez des alertes sur vos commandes et produits disponibles
          </p>

          <div className="space-y-4">
            <button
              onClick={onAllow}
              className="w-full bg-secondary hover:bg-secondary/90 text-white py-4 rounded-xl transition-colors"
            >
              Autoriser les notifications
            </button>

            <button
              onClick={onSkip}
              className="w-full text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Plus tard
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
