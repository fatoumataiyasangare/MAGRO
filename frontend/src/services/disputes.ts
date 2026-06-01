import { apiFetch } from "./api";
import { getConfig } from "./config";

export interface Dispute {
  id: string;
  orderId: string;
  openedBy: string;
  reason: string;
  status: "NEW" | "IN_REVIEW" | "AWAITING_EVIDENCE" | "RESOLVED";
  adminDecision?: "FARMER_WINS" | "BUYER_WINS" | "SPLIT" | "PARTIAL_REFUND";
  splitRatio?: number;
  decisionNote?: string;
  decidedBy?: string;
  createdAt: string;
  orderPrice: number;
  buyerName: string;
  cropName: string;
}

const LOCAL_STORAGE_KEY = "magro_mock_disputes";

function getMockDisputes(): Dispute[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    const initial: Dispute[] = [
      {
        id: "dis-1",
        orderId: "ord-1",
        openedBy: "buyer-1",
        reason: "Écart de quantité de tomates constatée lors de la livraison (40 kg reçus au lieu de 50 kg).",
        status: "NEW",
        createdAt: new Date(Date.now() - 1000 * 3600 * 5).toISOString(),
        orderPrice: 37500,
        buyerName: "Amadou K.",
        cropName: "Tomates fraîches"
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function saveMockDisputes(disputes: Dispute[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(disputes));
}

export async function openDispute(orderId: string, reason: string, orderPrice = 10000, cropName = "Produit", buyerName = "Client") {
  const cfg = getConfig();
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    const disputes = getMockDisputes();
    const newDispute: Dispute = {
      id: "dis-" + Date.now(),
      orderId,
      openedBy: "mock-buyer",
      reason,
      status: "NEW",
      createdAt: new Date().toISOString(),
      orderPrice,
      buyerName,
      cropName
    };
    disputes.push(newDispute);
    saveMockDisputes(disputes);
    return newDispute;
  }

  return apiFetch<Dispute>("/orders/" + orderId + "/dispute", {
    method: "POST",
    body: JSON.stringify({ reason })
  });
}

export async function fetchDisputes() {
  const cfg = getConfig();
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    return getMockDisputes();
  }
  return apiFetch<Dispute[]>("/admin/disputes");
}

export async function resolveDispute(
  disputeId: string,
  decision: "FARMER_WINS" | "BUYER_WINS" | "SPLIT" | "PARTIAL_REFUND",
  splitRatio?: number,
  note?: string
) {
  const cfg = getConfig();
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    const disputes = getMockDisputes();
    const idx = disputes.findIndex((d) => d.id === disputeId);
    if (idx !== -1) {
      disputes[idx] = {
        ...disputes[idx],
        status: "RESOLVED",
        adminDecision: decision,
        splitRatio,
        decisionNote: note,
        decidedBy: "mock-moderator"
      };
      saveMockDisputes(disputes);
      return disputes[idx];
    }
    throw new Error("Litige non trouvé");
  }

  return apiFetch<Dispute>(`/admin/disputes/${disputeId}/resolve`, {
    method: "PATCH",
    body: JSON.stringify({ decision, splitRatio, decisionNote: note })
  });
}
