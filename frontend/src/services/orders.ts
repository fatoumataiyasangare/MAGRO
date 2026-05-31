import { apiFetch } from "./api";
import { getConfig } from "./config";

export interface FarmerOrder {
  id: string;
  crop: string;
  buyer: string;
  quantity: number;
  status: string;
  date: string;
  totalPrice: number;
  unit: string;
}

/**
 * Données mockées pour les commandes en mode développement
 */
const MOCK_ORDERS: FarmerOrder[] = [
  {
    id: "1",
    crop: "Tomates",
    buyer: "Amadou K.",
    quantity: 50,
    status: "Confirmée",
    date: "2026-04-15",
    totalPrice: 37500,
    unit: "kg"
  },
  {
    id: "2",
    crop: "Oignons",
    buyer: "Fatoumata D.",
    quantity: 100,
    status: "Prête",
    date: "2026-04-20",
    totalPrice: 50000,
    unit: "kg"
  }
];

/**
 * Place une commande
 * Utilise la logique de bascule automatique entre API réelle et mode simulé
 */
export async function placeOrder(listingId: string, quantity: number) {
  const cfg = getConfig();
  
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    console.log("[Mock Orders] Création de commande simulée");
    
    const mockOrder = {
      id: "mock-order-" + Date.now(),
      status: "EN_ATTENTE",
      totalPrice: quantity * 750 // Prix fictif
    };
    
    return mockOrder;
  }
  
  return apiFetch<{ id: string; status: string; totalPrice: number }>("/orders", {
    method: "POST",
    body: JSON.stringify({ listingId, quantity })
  });
}

/**
 * Récupère les commandes du fermier
 * Utilise la logique de bascule automatique entre API réelle et mode simulé
 */
export async function fetchFarmerOrders() {
  const cfg = getConfig();
  
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    console.log("[Mock Orders] Utilisation des données mockées pour les commandes");
    return MOCK_ORDERS;
  }
  
  return apiFetch<FarmerOrder[]>("/orders/mine");
}
