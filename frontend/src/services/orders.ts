import { apiFetch } from "./api";
import { getConfig } from "./config";

export interface FarmerOrder {
  id: string;
  crop: string;
  buyer: string;
  quantity: number;
  status: string; // EN_ATTENTE, CONFIRMEE, READY (Prête), DELIVERED (Livrée), DISPUTED (En litige)
  date: string;
  totalPrice: number;
  unit: string;
  depositAmount?: number;
  depositRequired?: boolean;
  riskScore?: number;
  paymentStatus?: "UNPAID" | "DEPOSIT_PAID" | "ESCROW" | "RELEASED" | "REFUNDED" | "PARTIAL_REFUND";
}

const LOCAL_STORAGE_KEY = "magro_mock_orders";

function getMockOrders(): FarmerOrder[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    const initial: FarmerOrder[] = [
      {
        id: "ord-1",
        crop: "Tomates",
        buyer: "Amadou K.",
        quantity: 50,
        status: "CONFIRMEE",
        date: "2026-04-15",
        totalPrice: 37500,
        unit: "kg",
        depositRequired: false,
        riskScore: 10,
        paymentStatus: "ESCROW"
      },
      {
        id: "ord-2",
        crop: "Oignons",
        buyer: "Fatoumata D.",
        quantity: 100,
        status: "PRETE",
        date: "2026-04-20",
        totalPrice: 50000,
        unit: "kg",
        depositRequired: true,
        depositAmount: 15000,
        riskScore: 40,
        paymentStatus: "DEPOSIT_PAID"
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function saveMockOrders(orders: FarmerOrder[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
}

export async function placeOrder(
  listingId: string,
  quantity: number,
  options?: {
    depositRequired: boolean;
    depositAmount: number;
    riskScore: number;
    cropName?: string;
  }
) {
  const cfg = getConfig();
  
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    console.log("[Mock Orders] Création de commande simulée avec acompte...");
    
    const orders = getMockOrders();
    const newOrder: FarmerOrder = {
      id: "ord-" + Date.now(),
      crop: options?.cropName || "Tomates",
      buyer: "Acheteur Test",
      quantity,
      status: "EN_ATTENTE",
      date: new Date().toISOString().split("T")[0],
      totalPrice: quantity * 750, // Prix unitaire par défaut
      unit: "kg",
      depositRequired: options?.depositRequired ?? false,
      depositAmount: options?.depositAmount ?? 0,
      riskScore: options?.riskScore ?? 0,
      paymentStatus: (options?.depositRequired) ? "UNPAID" : "ESCROW"
    };
    
    orders.push(newOrder);
    saveMockOrders(orders);
    return newOrder;
  }
  
  return apiFetch<FarmerOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({ listingId, quantity, ...options })
  });
}

export async function fetchFarmerOrders() {
  const cfg = getConfig();
  
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    return getMockOrders();
  }
  
  return apiFetch<FarmerOrder[]>("/orders/mine");
}

export async function updateOrderStatus(orderId: string, status: string) {
  const cfg = getConfig();
  
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    console.log("[Mock Orders] Mise à jour du statut vers", status);
    const orders = getMockOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = status;
      if (status === "READY") {
        // Envoi SMS simulé pour informer l'acheteur
        console.log(`[SMS OTP/ALERT] Commande #${orderId} prête! Notification envoyée à l'acheteur.`);
      }
      saveMockOrders(orders);
      return orders[idx];
    }
    throw new Error("Commande non trouvée");
  }
  
  return apiFetch<FarmerOrder>(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export async function confirmDelivery(orderId: string) {
  const cfg = getConfig();
  
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    console.log("[Mock Orders] Confirmation de livraison par l'acheteur");
    const orders = getMockOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = "DELIVERED";
      orders[idx].paymentStatus = "RELEASED"; // Les fonds sont libérés
      saveMockOrders(orders);
      return orders[idx];
    }
    throw new Error("Commande non trouvée");
  }
  
  return apiFetch<FarmerOrder>(`/orders/${orderId}/confirm-delivery`, {
    method: "POST"
  });
}
