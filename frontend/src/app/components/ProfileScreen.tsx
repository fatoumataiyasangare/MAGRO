import { ArrowLeft, Star, Package, Settings, LogOut, ChevronRight, Bell, HelpCircle, Shield } from "lucide-react";
import { motion } from "motion/react";

interface ProfileScreenProps {
  onBack: () => void;
}

export default function ProfileScreen({ onBack }: ProfileScreenProps) {
  const orders = [
    {
      id: "1",
      product: "Tomates fraîches",
      quantity: "50 kg",
      status: "En cours",
      date: "10 Avril 2026",
      price: "37,500 FCFA"
    },
    {
      id: "2",
      product: "Oignons blancs",
      quantity: "100 kg",
      status: "Livrée",
      date: "5 Avril 2026",
      price: "50,000 FCFA"
    },
    {
      id: "3",
      product: "Mangues Kent",
      quantity: "25 kg",
      status: "Livrée",
      date: "1 Avril 2026",
      price: "30,000 FCFA"
    }
  ];

  return (
    <div className="h-screen bg-muted flex flex-col">
      <div className="bg-primary text-white px-6 pt-6 pb-12">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center">
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
            M
          </div>
          <h2 className="text-2xl mb-1">Moussa Diabaté</h2>
          <p className="text-white/80">+223 76 XX XX XX</p>
          <div className="flex items-center gap-2 mt-3">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white/90">Client vérifié</span>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto -mt-6">
        <motion.div
          className="bg-white rounded-t-3xl px-6 py-6 min-h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-muted rounded-2xl p-4 text-center">
              <p className="text-2xl text-primary mb-1">12</p>
              <p className="text-xs text-muted-foreground">Commandes</p>
            </div>
            <div className="bg-muted rounded-2xl p-4 text-center">
              <p className="text-2xl text-secondary mb-1">4.8</p>
              <p className="text-xs text-muted-foreground">Note</p>
            </div>
            <div className="bg-muted rounded-2xl p-4 text-center">
              <p className="text-2xl text-primary mb-1">3</p>
              <p className="text-xs text-muted-foreground">Avis</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg">Dernières commandes</h3>
              <button className="text-sm text-primary">Voir tout</button>
            </div>

            <div className="space-y-3">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-muted rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-base mb-1">{order.product}</h4>
                      <p className="text-sm text-muted-foreground">{order.quantity} • {order.date}</p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        order.status === "En cours"
                          ? "bg-secondary/10 text-secondary"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-primary">{order.price}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <h3 className="text-lg mb-4">Paramètres</h3>

            <button className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span>Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span>Sécurité et confidentialité</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <span>Aide et support</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span>Paramètres du compte</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <button className="w-full flex items-center justify-center gap-2 p-4 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-colors mb-6">
            <LogOut className="w-5 h-5" />
            <span>Se déconnecter</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
