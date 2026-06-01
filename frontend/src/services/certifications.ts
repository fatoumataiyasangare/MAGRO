import { apiFetch } from "./api";
import { getConfig } from "./config";

export interface CriteriaDetail {
  aspect: number;
  brix: number;
  hygiene: number;
  practices: number;
  traceability: number;
}

export interface Certification {
  id: string;
  farmerId: string;
  expertId?: string;
  cropName: string;
  score: number;
  badgeLevel?: "GOLD" | "SILVER";
  criteriaDetail?: CriteriaDetail;
  reportUrl?: string;
  validFrom?: string;
  validTo?: string;
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED" | "PENDING";
  createdAt: string;
}

const LOCAL_STORAGE_KEY = "magro_mock_certifications";

function getMockCerts(): Certification[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    // Initial data: one active certification for test oignons
    const initial: Certification[] = [
      {
        id: "cert-init-1",
        farmerId: "farmer-1",
        expertId: "expert-1",
        cropName: "Tomates fraîches",
        score: 85,
        badgeLevel: "GOLD",
        criteriaDetail: { aspect: 26, brix: 22, hygiene: 17, practices: 12, traceability: 8 },
        reportUrl: "https://magro.ml/reports/cert-init-1.pdf",
        status: "ACTIVE",
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function saveMockCerts(certs: Certification[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(certs));
}

export async function requestCertification(cropName: string) {
  const cfg = getConfig();
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    console.log("[Mock Certifications] Demande de certification reçue pour", cropName);
    const certs = getMockCerts();
    const newRequest: Certification = {
      id: "cert-" + Date.now(),
      farmerId: "mock-farmer",
      cropName,
      score: 0,
      status: "PENDING",
      createdAt: new Date().toISOString()
    };
    certs.push(newRequest);
    saveMockCerts(certs);
    return newRequest;
  }

  try {
    return await apiFetch<Certification>("/certifications/request", {
      method: "POST",
      body: JSON.stringify({ cropName })
    });
  } catch (err) {
    console.warn("[Certifications] API indisponible, fallback mock", err);
    const certs = getMockCerts();
    const newRequest: Certification = {
      id: "cert-" + Date.now(),
      farmerId: "mock-farmer",
      cropName,
      score: 0,
      status: "PENDING",
      createdAt: new Date().toISOString()
    };
    certs.push(newRequest);
    saveMockCerts(certs);
    return newRequest;
  }
}

export async function fetchCertificationRequests() {
  const cfg = getConfig();
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    return getMockCerts();
  }
  try {
    return await apiFetch<Certification[]>("/certifications");
  } catch (err) {
    console.warn("[Certifications] API indisponible, fallback mock", err);
    return getMockCerts();
  }
}

export async function submitInspectionScore(
  certId: string,
  score: number,
  criteriaDetail: CriteriaDetail
) {
  const cfg = getConfig();
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    console.log("[Mock Certifications] Soumission des scores pour", certId, score);
    const certs = getMockCerts();
    const idx = certs.findIndex((c) => c.id === certId);
    if (idx !== -1) {
      certs[idx] = {
        ...certs[idx],
        score,
        badgeLevel: score >= 80 ? "GOLD" : "SILVER",
        criteriaDetail,
        status: "ACTIVE",
        expertId: "mock-expert",
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 mois
        reportUrl: `https://magro.ml/reports/cert-${certId}.pdf`
      };
      saveMockCerts(certs);
      return certs[idx];
    }
    throw new Error("Certification non trouvée");
  }

  try {
    return await apiFetch<Certification>(`/certifications/${certId}/score`, {
      method: "POST",
      body: JSON.stringify({ score, criteriaDetail })
    });
  } catch (err) {
    console.warn("[Certifications] API indisponible, fallback mock", err);
    const certs = getMockCerts();
    const idx = certs.findIndex((c) => c.id === certId);
    if (idx !== -1) {
      certs[idx] = {
        ...certs[idx],
        score,
        badgeLevel: score >= 80 ? "GOLD" : "SILVER",
        criteriaDetail,
        status: "ACTIVE",
        expertId: "mock-expert",
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        reportUrl: `https://magro.ml/reports/cert-${certId}.pdf`
      };
      saveMockCerts(certs);
      return certs[idx];
    }
    throw new Error("Certification non trouvée");
  }
}
