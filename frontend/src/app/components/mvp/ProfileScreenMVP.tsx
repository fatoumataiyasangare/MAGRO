import { ArrowLeft, Settings, LogOut, ChevronRight, Package, Star } from "lucide-react";
import { motion } from "motion/react";

interface ProfileScreenMVPProps {
  userName: string;
  userRole: "buyer" | "farmer" | "regulator";
  onBack: () => void;
  onLogout: () => void;
}

export default function ProfileScreenMVP({ userName, userRole, onBack, onLogout }: ProfileScreenMVPProps) {
  const orders = [
    { id: "1", product: "Tomates fraîches", quantity: "50 kg", status: "Livrée", date: "15 Avr 2026" },
    { id: "2", product: "Oignons blancs", quantity: "100 kg", status: "En cours", date: "20 Avr 2026" }
  ];

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
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl mb-4">
            {userName.charAt(0)}
          </div>
          <h2 className="text-2xl mb-1">{userName}</h2>
          <p className="text-white/80">
            {userRole === "farmer"
              ? "Agriculteur"
              : userRole === "regulator"
              ? "Projecteur & Régulateur"
              : "Acheteur"}
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
