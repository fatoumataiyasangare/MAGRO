import { Monitor, Shield, TrendingUp, Users, FileText, BarChart3, Home as HomeIcon, MessageCircle, User, Settings } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import logoMagro from "../../../imports/image-removebg-preview.png";

interface ProjectorsRegulatorsScreenProps {
  userName: string;
  onNavigate: (screen: string) => void;
}

export default function ProjectorsRegulatorsScreen({ userName, onNavigate }: ProjectorsRegulatorsScreenProps) {
  const [activeTab, setActiveTab] = useState("home");

  const stats = [
    { label: "Producteurs actifs", value: "127", color: "text-primary", icon: Users },
    { label: "Transactions ce mois", value: "342", color: "text-secondary", icon: TrendingUp },
    { label: "Revenus total", value: "5.2M FCFA", color: "text-blue-600", icon: BarChart3 }
  ];

  const quickActions = [
    { icon: Shield, label: "Vérifier producteur", color: "bg-primary/10 text-primary" },
    { icon: FileText, label: "Rapports", color: "bg-secondary/10 text-secondary" },
    { icon: BarChart3, label: "Statistiques", color: "bg-blue-100 text-blue-600" },
    { icon: Settings, label: "Paramètres", color: "bg-gray-100 text-gray-600" }
  ];

  const recentActivities = [
    {
      id: "1",
      type: "verification",
      title: "Nouveau producteur vérifié",
      description: "Amadou Traoré - Sikasso",
      time: "Il y a 2h",
      status: "success"
    },
    {
      id: "2",
      type: "transaction",
      title: "Transaction importante",
      description: "500 kg Tomates - 375K FCFA",
      time: "Il y a 5h",
      status: "info"
    },
    {
      id: "3",
      type: "alert",
      title: "Alerte qualité",
      description: "Vérification requise pour commande #MAG-042",
      time: "Il y a 1j",
      status: "warning"
    }
  ];

  return (
    <div className="h-screen bg-muted flex flex-col pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <img
              src={logoMagro}
              alt="MAGRO"
              className="h-10 mb-3"
            />
            <h1 className="text-lg">Bonjour, {userName} 👋</h1>
            <p className="text-white/80 text-sm">Projecteur & Régulateur</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 bg-white/20 rounded-lg">
              <Shield className="w-5 h-5" />
            </button>
            <button className="relative p-2 bg-white/20 rounded-lg">
              <Monitor className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-xs rounded-full flex items-center justify-center">
                5
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-3 -mt-6 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="bg-white rounded-xl p-4 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                    <div className={`text-2xl ${stat.color}`}>{stat.value}</div>
                  </div>
                  <div className={`w-12 h-12 ${stat.color === "text-primary" ? "bg-primary/10" : stat.color === "text-secondary" ? "bg-secondary/10" : "bg-blue-100"} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-muted transition-colors"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-center">{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg">Activités récentes</h2>
            <button className="text-primary text-sm">Voir tout</button>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                className="bg-white rounded-xl p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activity.status === "success" ? "bg-green-100" :
                    activity.status === "warning" ? "bg-yellow-100" :
                    "bg-blue-100"
                  }`}>
                    {activity.type === "verification" && <Shield className="w-5 h-5 text-green-600" />}
                    {activity.type === "transaction" && <TrendingUp className="w-5 h-5 text-blue-600" />}
                    {activity.type === "alert" && <Monitor className="w-5 h-5 text-yellow-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm mb-1">{activity.title}</h3>
                    <p className="text-xs text-muted-foreground mb-1">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
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
