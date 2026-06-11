import { apiFetch } from "./api";

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
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED" | "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export async function requestCertification(cropName: string) {
  return await apiFetch<Certification>("/certifications/request", {
    method: "POST",
    body: JSON.stringify({ cropName })
  });
}

export async function fetchCertificationRequests() {
  return await apiFetch<Certification[]>("/certifications");
}

export async function submitInspectionScore(
  certId: string,
  score: number,
  criteriaDetail: CriteriaDetail
) {
  return await apiFetch<Certification>(`/certifications/${certId}/score`, {
    method: "POST",
    body: JSON.stringify({ score, criteriaDetail })
  });
}
