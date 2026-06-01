import { apiFetch } from "./api";
import { getConfig } from "./config";

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

const LOCAL_STORAGE_KEY = "magro_mock_contracts";

function getMockContracts(): SeasonalContract[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    const initial: SeasonalContract[] = [
      {
        id: "con-1",
        buyerId: "buyer-industry-1",
        buyerName: "Grands Moulins du Mali (GMM)",
        farmerId: "farmer-1",
        farmerName: "Amadou Traoré",
        cropName: "Maïs blanc",
        totalQuantityKg: 25000,
        pricePerKg: 300,
        seasonStart: "2026-06-01",
        seasonEnd: "2026-11-30",
        deliverySchedule: { type: "fractionné", details: "5000 kg par mois" },
        status: "PENDING",
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function saveMockContracts(contracts: SeasonalContract[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contracts));
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
}) {
  const cfg = getConfig();
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    console.log("[Mock Contracts] Contrat créé pour", data.cropName);
    const contracts = getMockContracts();
    const newContract: SeasonalContract = {
      id: "con-" + Date.now(),
      buyerId: "mock-buyer-industry",
      buyerName: "Industrie Agro-Mali",
      farmerId: data.farmerId,
      farmerName: data.farmerName,
      cropName: data.cropName,
      totalQuantityKg: data.totalQuantityKg,
      pricePerKg: data.pricePerKg,
      seasonStart: data.seasonStart,
      seasonEnd: data.seasonEnd,
      deliverySchedule: data.deliverySchedule,
      status: "PENDING",
      createdAt: new Date().toISOString()
    };
    contracts.push(newContract);
    saveMockContracts(contracts);
    return newContract;
  }

  try {
    return await apiFetch<SeasonalContract>("/contracts", {
      method: "POST",
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.warn("[Contracts] API indisponible, fallback mock", err);
    const contracts = getMockContracts();
    const newContract: SeasonalContract = {
      id: "con-" + Date.now(),
      buyerId: "mock-buyer-industry",
      buyerName: "Industrie Agro-Mali",
      farmerId: data.farmerId,
      farmerName: data.farmerName,
      cropName: data.cropName,
      totalQuantityKg: data.totalQuantityKg,
      pricePerKg: data.pricePerKg,
      seasonStart: data.seasonStart,
      seasonEnd: data.seasonEnd,
      deliverySchedule: data.deliverySchedule,
      status: "PENDING",
      createdAt: new Date().toISOString()
    };
    contracts.push(newContract);
    saveMockContracts(contracts);
    return newContract;
  }
}

export async function fetchMyContracts() {
  const cfg = getConfig();
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    return getMockContracts();
  }
  try {
    return await apiFetch<SeasonalContract[]>("/contracts/mine");
  } catch (err) {
    console.warn("[Contracts] API indisponible, fallback mock", err);
    return getMockContracts();
  }
}

export async function updateContractStatus(contractId: string, status: "ACTIVE" | "CANCELLED") {
  const cfg = getConfig();
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    console.log("[Mock Contracts] Mise à jour du contrat", contractId, "vers", status);
    const contracts = getMockContracts();
    const idx = contracts.findIndex((c) => c.id === contractId);
    if (idx !== -1) {
      contracts[idx] = {
        ...contracts[idx],
        status
      };
      saveMockContracts(contracts);
      return contracts[idx];
    }
    throw new Error("Contrat non trouvé");
  }

  try {
    return await apiFetch<SeasonalContract>(`/contracts/${contractId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
  } catch (err) {
    console.warn("[Contracts] API indisponible, fallback mock", err);
    const contracts = getMockContracts();
    const idx = contracts.findIndex((c) => c.id === contractId);
    if (idx !== -1) {
      contracts[idx] = {
        ...contracts[idx],
        status
      };
      saveMockContracts(contracts);
      return contracts[idx];
    }
    throw new Error("Contrat non trouvé");
  }
}
