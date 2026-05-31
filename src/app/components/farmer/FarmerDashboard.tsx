import { Plus, Package, TrendingUp, Bell, FileText, Award, DollarSign } from "lucide-react";
import { motion } from "motion/react";

interface FarmerDashboardProps {
  userName: string;
  onNavigate: (screen: string) => void;
}

export default function FarmerDashboard({ userName, onNavigate }: FarmerDashboardProps) {
  const stats = [
    { label: "En attente", value: "3", color: "text-secondary" },
    { label: "En séquestre", value: "245 000 FCFA", color: "text-primary" },
    { label: "Annonces actives", value: "5", color: "text-blue-600" }
  ];

  const quickActions = [
    { icon: Plus, label: "Publier une annonce", action: "create-listing" },
    { icon: Package, label: "Voir commandes", action: "orders" },
    { icon: Award, label: "Demander certification", action: "certification" },
    { icon: DollarSign, label: "Mes revenus", action: "earnings" }
  ];

  const recentOrders = [
    { id: "1", crop: "Tomates", buyer: "Amadou K.", quantity: "50 kg", status: "confirmed" },
    { id: "2", crop: "Oignons", buyer: "Fatoumata D.", quantity: "100 kg", status: "ready" },
    { id: "3", crop: "Mangues", buyer: "Ibrahim S.", quantity: "25 kg", status: "in_production" }
  ];

  return (
    <div className="h-screen bg-muted flex flex-col pb-20">
      <div className="bg-primary text-white px-6 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl">
              {userName.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg">Bonjour, {userName} 👋</h1>
              <p className="text-white/80 text-sm">Producteur</p>
            </div>
          </div>
          <button className="relative">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        <div className="grid grid-cols-3 gap-3 -mt-6 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-xl p-4 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`text-2xl mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-lg mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  onClick={() => onNavigate(action.action)}
                  className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-muted transition-colors"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm text-center">{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg">Commandes récentes</h2>
            <button
              onClick={() => onNavigate("orders")}
              className="text-primary text-sm"
            >
              Voir tout
            </button>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order, index) => (
              <motion.div
                key={order.id}
                className="bg-white rounded-xl p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-base mb-1">{order.crop}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.buyer} • {order.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      order.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                      order.status === "ready" ? "bg-green-100 text-green-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>
                      {order.status === "confirmed" ? "Confirmée" :
                       order.status === "ready" ? "Prête" : "En production"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
