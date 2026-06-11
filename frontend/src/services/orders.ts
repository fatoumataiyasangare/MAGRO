import { apiFetch } from "./api";

export interface FarmerOrder {
  id: string;
  listingId?: string;
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
  return await apiFetch<FarmerOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({ listingId, quantity, ...options })
  });
}

export async function fetchFarmerOrders() {
  return await apiFetch<FarmerOrder[]>("/orders/mine");
}

export async function updateOrderStatus(orderId: string, status: string) {
  return await apiFetch<FarmerOrder>(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export async function confirmDelivery(orderId: string) {
  return await apiFetch<FarmerOrder>(`/orders/${orderId}/confirm-delivery`, {
    method: "POST"
  });
}

export async function cancelOrder(orderId: string) {
  return await apiFetch<FarmerOrder>(`/orders/${orderId}/cancel`, {
    method: "POST"
  });
}

export async function fetchBuyerOrders() {
  return await apiFetch<FarmerOrder[]>("/orders/buyer");
}
