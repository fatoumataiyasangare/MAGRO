import { apiFetch } from "./api";
import { getConfig } from "./config";

export interface AvailabilityAlert {
  id: string;
  buyerId: string;
  cropName: string;
  region?: string;
  createdAt: string;
}

const LOCAL_STORAGE_KEY = "magro_mock_alerts";

function getMockAlerts(): AvailabilityAlert[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    const initial: AvailabilityAlert[] = [
      {
        id: "alert-1",
        buyerId: "buyer-1",
        cropName: "Tomates fraîches",
        region: "Sikasso",
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function saveMockAlerts(alerts: AvailabilityAlert[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(alerts));
}

export async function createAlert(cropName: string, region?: string) {
  const cfg = getConfig();
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    console.log("[Mock Alerts] Alerte créée pour", cropName, region);
    const alerts = getMockAlerts();
    const newAlert: AvailabilityAlert = {
      id: "alert-" + Date.now(),
      buyerId: "mock-buyer",
      cropName,
      region,
      createdAt: new Date().toISOString()
    };
    alerts.push(newAlert);
    saveMockAlerts(alerts);
    return newAlert;
  }

  try {
    return await apiFetch<AvailabilityAlert>("/alerts", {
      method: "POST",
      body: JSON.stringify({ cropName, region })
    });
  } catch (err) {
    console.warn("[Alerts] API indisponible, fallback mock", err);
    const alerts = getMockAlerts();
    const newAlert: AvailabilityAlert = {
      id: "alert-" + Date.now(),
      buyerId: "mock-buyer",
      cropName,
      region,
      createdAt: new Date().toISOString()
    };
    alerts.push(newAlert);
    saveMockAlerts(alerts);
    return newAlert;
  }
}

export async function fetchMyAlerts() {
  const cfg = getConfig();
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    return getMockAlerts();
  }
  try {
    return await apiFetch<AvailabilityAlert[]>("/alerts/mine");
  } catch (err) {
    console.warn("[Alerts] API indisponible, fallback mock", err);
    return getMockAlerts();
  }
}
