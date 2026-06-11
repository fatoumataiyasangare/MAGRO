import { apiFetch } from "./api";

export interface SeasonalContract {
  id: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  cropName: string;
  totalQuantityKg: number;
  pricePerKg: number;
  seasonStart: string;
  seasonEnd: string;
  deliverySchedule: any;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  createdAt: string;
}

export async function createSeasonalContract(data: {
  farmerId: string;
  farmerName: string;
  cropName: string;
  totalQuantityKg: number;
  pricePerKg: number;
  seasonStart: string;
  seasonEnd: string;
  deliverySchedule: any;
}): Promise<SeasonalContract> {
  return await apiFetch<SeasonalContract>("/contracts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchMyContracts(): Promise<SeasonalContract[]> {
  return await apiFetch<SeasonalContract[]>("/contracts/mine");
}

export async function updateContractStatus(
  contractId: string,
  status: "ACTIVE" | "CANCELLED"
): Promise<SeasonalContract> {
  return await apiFetch<SeasonalContract>(`/contracts/${contractId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
