import { Plus, Package, Bell, Home as HomeIcon, MessageCircle, User, List } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface FarmerDashboardMVPProps {
  userName: string;
  onNavigate: (screen: string) => void;
  totalProducts?: number;
}

export default function FarmerDashboardMVP({ userName, onNavigate, totalProducts = 0 }: FarmerDashboardMVPProps) {
  const [activeTab, setActiveTab] = useState("home");

  const stats = [
    { label: "Annonces", value: totalProducts.toString(), color: "text-blue-600" },
    { label: "Commandes", value: "5", color: "text-secondary" },
    { label: "Revenus", value: "245K", color: "text-primary" }
  ];

  const orders = [
    { id: "1", crop: "Tomates", buyer: "Amadou K.", quantity: "50 kg", status: "Confirmée" },
    { id: "2", crop: "Oignons", buyer: "Fatoumata D.", quantity: "100 kg", status: "Prête" }
  ];

  return (
    <div className="h-screen bg-muted flex flex-col pb-20">
      {/* Header */}
      <div className="bg-primary text-white px-6 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl">
              {userName.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg">Bonjour {userName} 👋</h1>
              <p className="text-white/80 text-sm">Agriculteur</p>
            </div>
          </div>
          <button className="relative">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-xs rounded-full flex items-center justify-center">
              2
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6">
        {/* Stats */}
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

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.button
            onClick={() => onNavigate("create-listing")}
            className="bg-secondary hover:bg-secondary/90 text-white py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Plus className="w-5 h-5" />
            <span>Publier</span>
          </motion.button>
          <motion.button
            onClick={() => onNavigate("my-listings")}
            className="bg-white border border-border hover:bg-muted text-foreground py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <List className="w-5 h-5" />
            <span>Mes annonces</span>
          </motion.button>
        </div>

        {/* Orders */}
        <div>
          <h2 className="text-lg mb-4">Commandes reçues</h2>
          <div className="space-y-3">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                className="bg-white rounded-xl p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-base mb-1">{order.crop}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.buyer} • {order.quantity}
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full">
                    {order.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

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
            className={`flex flex-col items-center gap-1 ${
              activeTab === "chat" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <MessageCircle className="w-6 h-6" />
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
