import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { fetchFarmerOrders, FarmerOrder } from "../../../services/orders";

interface Order {
  id: string;
  crop: string;
  buyer: string;
  quantity: string;
  status: "Confirmée" | "Prête" | "En attente" | string;
  date: string;
  price?: string;
}

interface OrdersScreenMVPProps {
  onBack: () => void;
}

function formatStatus(status: string) {
  switch (status) {
    case "EN_ATTENTE":
      return "En attente";
    case "CONFIRMEE":
    case "CONFIRMED":
      return "Confirmée";
    case "PRETE":
      return "Prête";
    default:
      return status;
  }
}

function formatPrice(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

export default function OrdersScreenMVP({ onBack }: OrdersScreenMVPProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    fetchFarmerOrders()
      .then((remoteOrders) => {
        if (!mounted) return;

        setOrders(
          remoteOrders.map((order) => ({
            id: order.id,
            crop: order.crop,
            buyer: order.buyer,
            quantity: `${order.quantity} ${order.unit}`,
            status: formatStatus(order.status),
            date: new Date(order.date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric"
            }),
            price: formatPrice(order.totalPrice)
          }))
        );
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Impossible de charger les commandes");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Confirmée":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "Prête":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "En attente":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmée":
        return "bg-green-100 text-green-700";
      case "Prête":
        return "bg-blue-100 text-blue-700";
      case "En attente":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-white px-6 py-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex-shrink-0 p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold flex-1">Commandes reçues</h1>
        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
          {orders.length}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {loading ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
            <p className="text-muted-foreground">Chargement des commandes...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600">{error}</p>
          </motion.div>
        ) : orders.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Aucune commande pour le moment</p>
          </motion.div>
        ) : (
          orders.map((order, index) => (
            <motion.div
              key={order.id}
              className="bg-white rounded-lg border border-border p-4 shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Order Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground">
                    {order.crop}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {order.buyer} • {order.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Quantité</p>
                  <p className="text-base font-semibold text-foreground">
                    {order.quantity}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Montant</p>
                  <p className="text-base font-semibold text-primary">
                    {order.price || "—"}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full mt-4 bg-secondary hover:bg-secondary/90 text-white py-2 rounded-lg transition-colors text-sm font-medium">
                Voir détails
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
