import { apiFetch } from "./api";

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  documents: {
    identityCardUrl?: string;
    parcelPhotoUrl?: string;
    gpsCoordinates?: string;
    tradeRegistryUrl?: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  createdAt: string;
}

export async function submitVerificationRequest(documents: any, userName = "Moussa", userRole = "buyer") {
  return await apiFetch<VerificationRequest>("/admin/verifications", {
    method: "POST",
    body: JSON.stringify({ documents })
  });
}

export async function fetchVerificationRequests() {
  return await apiFetch<VerificationRequest[]>("/admin/verifications");
}

export async function processVerificationRequest(
  requestId: string,
  status: "APPROVED" | "REJECTED",
  rejectionReason?: string
) {
  return await apiFetch<VerificationRequest>(`/admin/verifications/${requestId}`, {
    method: "PATCH",
    body: JSON.stringify({ status, rejectionReason })
  });
}
