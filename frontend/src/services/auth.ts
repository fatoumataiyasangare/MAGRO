import { apiFetch, clearStoredAccessToken, setStoredAccessToken } from "./api";
import { getConfig } from "./config";

export type UserRole = "BUYER" | "FARMER" | "REGULATOR";

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  isVerified?: boolean;
  isPremium?: boolean;
}

const SESSION_KEY = "magro_mock_session";

function getMockSession(): UserProfile | null {
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data) as UserProfile;
  } catch {
    return null;
  }
}

function setMockSession(profile: UserProfile) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
}

function clearMockSession() {
  localStorage.removeItem(SESSION_KEY);
}

function getMockToken() {
  return `dev.${crypto.randomUUID()}`;
}

export async function requestOtp(phone: string): Promise<{ message: string }> {
  const cfg = getConfig();

  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    void phone;
    return { message: "OTP envoye (mode simule)" };
  }

  try {
    return await apiFetch<{ message: string }>("/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ phone })
    });
  } catch (err) {
    if (cfg.mockDataEnabled || (import.meta.env.MODE === "development" && err instanceof Error && err.message.includes("Failed to fetch"))) {
      console.warn("[Auth] API indisponible pour OTP, fallback mock", err);
      return { message: "OTP envoyé (mode simulé — backend hors ligne)" };
    }
    throw err;
  }
}

export async function verifyOtp(
  phone: string,
  otp: string
): Promise<{ accessToken: string; user: UserProfile }> {
  const cfg = getConfig();

  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    const storedRole = (localStorage.getItem("magro_user_role")?.toUpperCase() as UserRole | undefined) ?? "BUYER";
    const role: UserRole = storedRole === "FARMER" ? "FARMER" : "BUYER";
    const mockProfile: UserProfile = {
      id: "mock-user-1",
      phone,
      name: "Moussa Kouyate",
      role,
      isVerified: localStorage.getItem("magro_verified_status") === "true",
      isPremium: localStorage.getItem("magro_premium_status") === "true"
    };
    setMockSession(mockProfile);
    return { accessToken: getMockToken(), user: mockProfile };
  }

  try {
    const result = await apiFetch<{ accessToken: string; user: UserProfile }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp })
    });
    setStoredAccessToken(result.accessToken);
    return result;
  } catch (err) {
    if (cfg.mockDataEnabled || (import.meta.env.MODE === "development" && err instanceof Error && err.message.includes("Failed to fetch"))) {
      console.warn("[Auth] API indisponible pour verify OTP, fallback mock", err);
      const storedRole = (localStorage.getItem("magro_user_role")?.toUpperCase() as UserRole | undefined) ?? "BUYER";
      const role: UserRole = storedRole === "FARMER" ? "FARMER" : "BUYER";
      const mockProfile: UserProfile = {
        id: "mock-user-1",
        phone,
        name: "Moussa Kouyaté",
        role,
        isVerified: false,
        isPremium: false
      };
      setMockSession(mockProfile);
      return { accessToken: getMockToken(), user: mockProfile };
    }
    throw err;
  }
}

export async function fetchProfile(): Promise<UserProfile> {
  const cfg = getConfig();

  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    const session = getMockSession();
    if (session) {
      return session;
    }
    throw new Error("No active session");
  }

  try {
    return await apiFetch<UserProfile>("/profile");
  } catch (err) {
    if (cfg.mockDataEnabled || (import.meta.env.MODE === "development" && err instanceof Error && err.message.includes("Failed to fetch"))) {
      console.warn("[Auth] API indisponible pour profil, fallback mock", err);
      const session = getMockSession();
      if (session) return session;
    }
    throw err;
  }
}

export async function updateRole(role: UserRole): Promise<UserProfile> {
  const cfg = getConfig();
  localStorage.setItem("magro_user_role", role.toLowerCase());

  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    const session = getMockSession();
    const updated: UserProfile = session
      ? { ...session, role }
      : {
          id: "mock-user-1",
          phone: "+22370000001",
          name: "Moussa Kouyate",
          role
        };
    setMockSession(updated);
    return updated;
  }

  try {
    return await apiFetch<UserProfile>("/profile/role", {
      method: "PATCH",
      body: JSON.stringify({ role })
    });
  } catch (err) {
    console.warn("[Auth] API indisponible pour rôle, fallback mock", err);
    const session = getMockSession();
    const updated: UserProfile = session
      ? { ...session, role }
      : { id: "mock-user-1", phone: "+22370000001", name: "Moussa Kouyaté", role };
    setMockSession(updated);
    return updated;
  }
}

export async function logout(): Promise<void> {
  const cfg = getConfig();

  clearMockSession();
  clearStoredAccessToken();
  localStorage.removeItem("magro_user_role");
  localStorage.removeItem("magro_verified_status");
  localStorage.removeItem("magro_premium_status");

  if (cfg.isApiAvailable && !cfg.mockDataEnabled) {
    await apiFetch<void>("/auth/logout", {
      method: "POST"
    }).catch(() => undefined);
  }

  // Force page reload to clear React state and return to login
  window.location.href = "/";
}

export async function refreshSession(): Promise<string | null> {
  const cfg = getConfig();

  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    return getMockSession() ? getMockToken() : null;
  }

  try {
    const result = await apiFetch<{ accessToken: string }>("/auth/refresh", {
      method: "POST",
      credentials: "include"
    });
    if (result.accessToken) {
      setStoredAccessToken(result.accessToken);
      return result.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}
