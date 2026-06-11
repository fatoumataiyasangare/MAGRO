import { apiFetch } from "./api";

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

export async function openDispute(orderId: string, reason: string) {
  return await apiFetch<Dispute>("/orders/" + orderId + "/dispute", {
    method: "POST",
    body: JSON.stringify({ reason })
  });
}

export async function fetchDisputes() {
  return await apiFetch<Dispute[]>("/admin/disputes");
}

export async function resolveDispute(
  disputeId: string,
  decision: "FARMER_WINS" | "BUYER_WINS" | "SPLIT" | "PARTIAL_REFUND",
  splitRatio?: number,
  note?: string
) {
  return await apiFetch<Dispute>(`/admin/disputes/${disputeId}/resolve`, {
    method: "PATCH",
    body: JSON.stringify({ decision, splitRatio, decisionNote: note })
  });
}

export async function updateDisputeStatus(disputeId: string, status: string, note?: string) {
  return await apiFetch<Dispute>(`/admin/disputes/${disputeId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, decisionNote: note })
  });
}
