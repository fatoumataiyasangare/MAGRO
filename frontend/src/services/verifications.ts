import { apiFetch } from "./api";
import { getConfig } from "./config";

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

const LOCAL_STORAGE_KEY = "magro_mock_verifications";

function getMockVerifications(): VerificationRequest[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    const initial: VerificationRequest[] = [
      {
        id: "ver-1",
        userId: "farmer-2",
        userName: "Fatoumata Keita",
        userRole: "FARMER",
        documents: {
          identityCardUrl: "CNI_Fatoumata.jpg",
          parcelPhotoUrl: "Parcelle_Kayes.jpg",
          gpsCoordinates: "14.4452° N, 11.4325° W"
        },
        status: "PENDING",
        createdAt: new Date(Date.now() - 1000 * 3600 * 24).toISOString()
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function saveMockVerifications(reqs: VerificationRequest[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reqs));
}

export async function submitVerificationRequest(documents: any, userName = "Moussa", userRole = "buyer") {
  const cfg = getConfig();
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    const reqs = getMockVerifications();
    const newRequest: VerificationRequest = {
      id: "ver-" + Date.now(),
      userId: "mock-user-id",
      userName,
      userRole: userRole.toUpperCase(),
      documents,
      status: "PENDING",
      createdAt: new Date().toISOString()
    };
    reqs.push(newRequest);
    saveMockVerifications(reqs);
    return newRequest;
  }

  return apiFetch<VerificationRequest>("/admin/verifications", {
    method: "POST",
    body: JSON.stringify({ documents })
  });
}

export async function fetchVerificationRequests() {
  const cfg = getConfig();
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    return getMockVerifications();
  }
  return apiFetch<VerificationRequest[]>("/admin/verifications");
}

export async function processVerificationRequest(
  requestId: string,
  status: "APPROVED" | "REJECTED",
  rejectionReason?: string
) {
  const cfg = getConfig();
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    const reqs = getMockVerifications();
    const idx = reqs.findIndex((r) => r.id === requestId);
    if (idx !== -1) {
      reqs[idx] = {
        ...reqs[idx],
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason : undefined
      };
      saveMockVerifications(reqs);
      return reqs[idx];
    }
    throw new Error("Demande de vérification non trouvée");
  }

  return apiFetch<VerificationRequest>(`/admin/verifications/${requestId}`, {
    method: "PATCH",
    body: JSON.stringify({ status, rejectionReason })
  });
}
