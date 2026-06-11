import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, Clock, AlertCircle, ShieldAlert, Sparkles, Truck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchFarmerOrders, fetchBuyerOrders, FarmerOrder, updateOrderStatus, confirmDelivery, cancelOrder } from "../services/orders";
import { openDispute } from "../services/disputes";
import { useToast } from "../components/ToastProvider";

interface Order {
  id: string;
  listingId?: string;
  crop: string;
  buyer: string;
  quantity: string;
  status: string; // EN_ATTENTE, CONFIRMEE, PRETE, DELIVERED, CANCELLED, DISPUTED
  date: string;
  price: string;
  rawPrice: number;
  rawQuantity: number;
  depositRequired: boolean;
  depositAmount: number;
  riskScore: number;
  paymentStatus: string;
}

interface OrdersScreenMVPProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
  userRole?: string | null;
}

function formatStatus(status: string) {
  switch (status) {
    case "EN_ATTENTE":
      return "En attente";
    case "CONFIRMEE":
    case "CONFIRMED":
      return "Confirmée";
    case "PRETE":
    case "READY":
    case "SHIPPED":
      return "En livraison";
    case "DELIVERED":
      return "Livrée";
    case "CANCELLED":
      return "Annulée";
    case "DISPUTED":
      return "En Litige";
    default:
      return status;
  }
}

function formatPrice(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

export default function OrdersScreenMVP({ onBack, onNavigate, userRole: propRole }: OrdersScreenMVPProps) {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Expanded order card
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Modal states
  const [orderToConfirm, setOrderToConfirm] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  // Dispute form state
  const [disputeReason, setDisputeReason] = useState("");
  const [disputedOrderId, setDisputedOrderId] = useState<string | null>(null);

  // Rating state
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(5);

  // Detect user role from local storage if not in props
  const [role, setRole] = useState<string>(() => {
    if (propRole) return propRole;
    return (localStorage.getItem("magro_user_role")?.toLowerCase()) || "buyer";
  });

  const loadOrders = () => {
    setLoading(true);
    const fetchFunc = role === "buyer" ? fetchBuyerOrders : fetchFarmerOrders;
    fetchFunc()
      .then((remoteOrders) => {
        // En mode acheteur, filtrer les commandes passées par l'acheteur de test, sinon tout afficher pour le fermier
        const processed = remoteOrders.map((order) => ({
          id: order.id,
          listingId: order.listingId,
          crop: order.crop,
          buyer: order.buyer,
          quantity: `${order.quantity} kg`,
          rawQuantity: order.quantity,
          status: order.status,
          date: order.date,
          price: formatPrice(order.totalPrice),
          rawPrice: order.totalPrice,
          depositRequired: order.depositRequired ?? false,
          depositAmount: order.depositAmount ?? 0,
          riskScore: order.riskScore ?? 0,
          paymentStatus: order.paymentStatus || "UNPAID"
        }));
        setOrders(processed);
      })
      .catch((err) => {
        setError(err.message || "Impossible de charger les commandes");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMEE":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "PRETE":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "EN_ATTENTE":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "DISPUTED":
        return <ShieldAlert className="w-5 h-5 text-red-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMEE":
        return "bg-green-100 text-green-700";
      case "PRETE":
        return "bg-blue-100 text-blue-700";
      case "EN_ATTENTE":
        return "bg-yellow-100 text-yellow-700";
      case "DELIVERED":
        return "bg-green-500 text-white";
      case "DISPUTED":
        return "bg-red-100 text-red-700";
      case "CANCELLED":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Farmer accepts order (updates state CONFIRMEE)
  const handleAcceptOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, "CONFIRMEE");
      showToast("Commande acceptée avec succès ! Le stock a été mis à jour.", "success");
      loadOrders();
    } catch (err) {
      showToast("Impossible de modifier le statut.", "error");
    }
  };

  // Farmer refuses order
  const handleRefuseOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, "CANCELLED");
      showToast("Commande refusée.", "info");
      loadOrders();
    } catch (err) {
      showToast("Impossible de refuser la commande.", "error");
    }
  };

  // Farmer marks crop as ready
  const handleReadyOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, "SHIPPED");
      showToast("La livraison a été lancée.", "success");
      loadOrders();
    } catch (err: any) {
      showToast(err.message || "Erreur.", "error");
    }
  };

  // Buyer confirms delivery (Escrow release)
  const handleConfirmDelivery = async (orderId: string) => {
    try {
      await confirmDelivery(orderId);
      showToast("Livraison confirmée. Fonds libérés vers l'agriculteur !", "success");
      loadOrders();
    } catch (err) {
      showToast("Erreur lors de la confirmation.", "error");
    }
    setOrderToConfirm(null);
  };

  // Buyer cancels order
  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId);
      showToast("Commande annulée et fonds remboursés.", "success");
      loadOrders();
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'annulation.", "error");
    }
    setOrderToCancel(null);
  };

  // Buyer rates farmer
  const handleRateFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Merci pour votre évaluation de ${ratingValue} étoiles !`, "success");
    setRatingOrderId(null);
  };

  // Buyer submits dispute
  const handleOpenDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason || !disputedOrderId) return;

    try {
      await openDispute(
        disputedOrderId,
        disputeReason
      );
      
      showToast("Litige ouvert. Les fonds sont gelés.", "info");
      setDisputedOrderId(null);
      setDisputeReason("");
      loadOrders();
    } catch (err) {
      showToast("Erreur lors de l'ouverture du litige.", "error");
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
        <h1 className="text-xl font-semibold flex-1">
          {role === "farmer" ? "Commandes reçues" : "Mes commandes passées"}
        </h1>
        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
          {orders.length}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Clock className="w-8 h-8 text-muted-foreground animate-spin mb-4" />
            <p className="text-muted-foreground">Chargement des commandes...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune commande pour le moment</p>
          </div>
        ) : (
          orders.map((order, index) => (
            <motion.div
              key={order.id}
              className="bg-white rounded-xl border border-border p-4 shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Order Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground">
                    {order.crop}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {role === "farmer" ? `Acheteur : ${order.buyer}` : "Statut Séquestre actif"} • {order.date}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(order.status)}
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>
              </div>

              {/* Order Details Grid */}
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
                    {order.price}
                  </p>
                </div>
              </div>

              {/* Collapsible Action Details panel */}
              {expandedOrderId === order.id && (
                <motion.div 
                  className="mt-4 pt-4 border-t border-dashed border-gray-200 space-y-3 text-xs bg-gray-50/50 p-3 rounded-xl"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <div className="grid grid-cols-2 gap-2 text-gray-600">
                    <div><strong>ID Commande :</strong> #{order.id.slice(0, 8)}</div>
                    <div><strong>Score de Risque :</strong> {order.riskScore}/100</div>
                    <div><strong>Acompte Requis :</strong> {order.depositRequired ? "Oui" : "Non"}</div>
                    <div>
                      <strong>Acompte Payé :</strong> {order.depositRequired ? `${formatPrice(order.depositAmount)}` : "N/A"}
                    </div>
                    <div className="col-span-2">
                      <strong>Statut du séquestre :</strong>{" "}
                      <span className="font-semibold text-primary">
                        {order.paymentStatus === "RELEASED" ? "Fonds libérés au vendeur" :
                         order.paymentStatus === "REFUNDED" ? "Fonds remboursés à l'acheteur" :
                         order.paymentStatus === "DEPOSIT_PAID" ? "Acompte séquestré, solde restant à livrer" :
                         order.paymentStatus === "ESCROW" ? "100% sécurisé en séquestre" : "En attente de paiement"}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons for Farmer */}
                  {role === "farmer" && (
                    <div className="flex gap-2 pt-2">
                      {order.status === "EN_ATTENTE" && (
                        <>
                          <button
                            onClick={() => handleAcceptOrder(order.id)}
                            className="flex-1 bg-secondary text-white py-2 rounded-lg font-semibold text-xs"
                          >
                            Accepter la commande
                          </button>
                          <button
                            onClick={() => handleRefuseOrder(order.id)}
                            className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-semibold text-xs"
                          >
                            Refuser
                          </button>
                        </>
                      )}
                      {(order.status === "CONFIRMEE" || order.status === "CONFIRMED") && (
                        <button
                          onClick={() => handleReadyOrder(order.id)}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Lancer la livraison
                        </button>
                      )}
                      {(order.status === "PRETE" || order.status === "SHIPPED") && (
                        <div className="w-full text-center text-muted-foreground p-1 text-xs">
                          En attente de confirmation de livraison par l'acheteur. Libération automatique sous 72h.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions buttons for Buyer */}
                  {role === "buyer" && (
                    <div className="flex flex-col gap-2 pt-2">
                      {(order.status === "EN_ATTENTE" || order.status === "CONFIRMEE" || order.status === "CONFIRMED") && (
                        <button
                          onClick={() => setOrderToCancel(order.id)}
                          className="w-full bg-red-100 text-red-700 hover:bg-red-200 py-2 rounded-lg font-semibold text-xs transition-colors"
                        >
                          Annuler la commande
                        </button>
                      )}
                      {(order.status === "PRETE" || order.status === "SHIPPED") && (
                        <>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setOrderToConfirm(order.id)}
                              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Confirmer la livraison
                            </button>
                            <button
                              onClick={() => setDisputedOrderId(order.id)}
                              className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-semibold text-xs"
                            >
                              Signaler un litige
                            </button>
                          </div>
                          {onNavigate && (
                            <button
                              onClick={() => onNavigate("transport")}
                              className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Rechercher un transporteur
                            </button>
                          )}
                        </>
                      )}
                      {(order.status === "CONFIRMEE" || order.status === "CONFIRMED") && onNavigate && (
                        <button
                          onClick={() => onNavigate("transport")}
                          className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Organiser le transport
                        </button>
                      )}
                      {order.status === "EN_ATTENTE" && (
                        <>
                          <div className="w-full text-center text-muted-foreground p-1 text-xs">
                            En attente de confirmation de la part du producteur. (48h max)
                          </div>
                          <button
                            onClick={() => setOrderToCancel(order.id)}
                            className="w-full bg-red-50 text-red-700 py-2 rounded-lg font-semibold text-xs border border-red-100 hover:bg-red-100 transition-colors"
                          >
                            Annuler la demande
                          </button>
                        </>
                      )}
                      {order.status === "DELIVERED" && (
                        <button
                          onClick={() => setRatingOrderId(order.id)}
                          className="w-full bg-yellow-50 text-yellow-700 py-2 rounded-lg font-semibold text-xs border border-yellow-200 hover:bg-yellow-100 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Évaluer le producteur
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Rating modal */}
              {ratingOrderId === order.id && (
                <form onSubmit={handleRateFarmer} className="mt-3 pt-3 border-t border-yellow-200 space-y-3">
                  <p className="text-xs text-yellow-800 font-semibold">Évaluer cette commande</p>
                  <div className="flex justify-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingValue(star)}
                        className={`text-2xl ${star <= ratingValue ? "text-yellow-400" : "text-gray-300"} hover:scale-110 transition-transform`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-yellow-400 text-yellow-900 py-2 rounded-lg font-semibold text-xs">
                      Envoyer l'avis
                    </button>
                    <button type="button" onClick={() => setRatingOrderId(null)} className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-xs">
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              {/* Dispute form input (if user clicked "Signaler un litige") */}
              {disputedOrderId === order.id && (
                <form onSubmit={handleOpenDispute} className="mt-3 pt-3 border-t border-red-200 space-y-2">
                  <p className="text-xs text-red-700 font-semibold">Ouvrir un dossier de litige</p>
                  <textarea
                    placeholder="Saisissez le motif exact du litige (ex: qualité non conforme, calibre trop petit, fruits abîmés...)"
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    required
                    className="w-full text-xs p-2 bg-red-50/50 border border-red-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold text-xs"
                    >
                      Soumettre le litige
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisputedOrderId(null)}
                      className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-xs"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              {/* Toggle Details button */}
              <button
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                className="w-full mt-4 bg-muted hover:bg-muted/80 text-foreground py-2 rounded-lg transition-colors text-sm font-medium"
              >
                {expandedOrderId === order.id ? "Masquer les détails" : "Voir détails & actions"}
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Confirmation Modals */}
      {orderToConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Confirmer la réception</h3>
              <p className="text-sm text-gray-500">Confirmez-vous la réception conforme de votre commande ? Les fonds seront définitivement libérés vers l'agriculteur.</p>
            </div>
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => handleConfirmDelivery(orderToConfirm)}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
              >
                Confirmer
              </button>
              <button
                onClick={() => setOrderToConfirm(null)}
                className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {orderToCancel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Annuler la commande</h3>
              <p className="text-sm text-gray-500">Êtes-vous sûr de vouloir annuler cette commande ? Les fonds séquestrés vous seront remboursés.</p>
            </div>
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => handleCancelOrder(orderToCancel)}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors"
              >
                Annuler la commande
              </button>
              <button
                onClick={() => setOrderToCancel(null)}
                className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                Retour
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
