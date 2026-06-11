import { apiFetch } from "./api";

export interface AvailabilityAlert {
  id: string;
  buyerId: string;
  cropName: string;
  region?: string;
  createdAt: string;
}

export async function createAlert(cropName: string, region?: string) {
  return await apiFetch<AvailabilityAlert>("/alerts", {
    method: "POST",
    body: JSON.stringify({ cropName, region })
  });
}

export async function fetchMyAlerts() {
  return await apiFetch<AvailabilityAlert[]>("/alerts/mine");
}
