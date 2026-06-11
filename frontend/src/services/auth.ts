import { apiFetch, clearStoredAccessToken, getStoredAccessToken, setStoredAccessToken, triggerGlobalError } from "./api";

export type UserRole = "BUYER" | "FARMER" | "REGULATOR" | "MODERATOR" | "SUPER_ADMIN" | "ANALYST";

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  isVerified?: boolean;
  isPremium?: boolean;
  rating?: number;
  email?: string | null;
  avatarUrl?: string | null;
  region?: string;
  buyerType?: string;
}

export async function requestOtp(phone: string, isSignup: boolean = false): Promise<{ message: string }> {
  return await apiFetch<{ message: string }>("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ phone, isSignup })
  });
}

export async function resendOtp(phone: string): Promise<{ message: string }> {
  return await apiFetch<{ message: string }>("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ phone })
  });
}

export async function verifyOtp(
  phone: string,
  otp: string,
  name?: string,
  role?: string
): Promise<{ accessToken: string; user: UserProfile }> {
  const result = await apiFetch<{ accessToken: string; user: UserProfile }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ 
      phone, 
      otp, 
      name, 
      ...(role && { role: role.toUpperCase() }) 
    })
  });
  setStoredAccessToken(result.accessToken);
  return result;
}

export async function fetchProfile(): Promise<UserProfile> {
  // If no in-memory token, try to restore session via refresh cookie first
  if (!getStoredAccessToken()) {
    await refreshSession().catch(() => {});
  }
  return await apiFetch<UserProfile>("/profile/me");
}

export async function updateRole(role: UserRole): Promise<UserProfile> {
  localStorage.setItem("magro_user_role", role.toLowerCase());

  try {
    return await apiFetch<UserProfile>("/profile/role", {
      method: "PATCH",
      body: JSON.stringify({ role })
    });
  } catch (err) {
    throw err;
  }
}

export async function logout(): Promise<void> {
  clearStoredAccessToken();
  localStorage.removeItem("magro_user_role");
  localStorage.removeItem("magro_verified_status");
  localStorage.removeItem("magro_premium_status");

  const isAdmin = window.location.pathname.includes("/admin");

  await apiFetch<void>("/auth/logout", {
    method: "POST"
  }).catch(() => undefined);

  if (isAdmin) {
    window.location.href = "/admin";
  } else {
    window.location.href = "/";
  }
}

export async function refreshSession(): Promise<string | null> {
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

export async function requestAccountDeletion(reason?: string): Promise<void> {
  await apiFetch<void>("/profile/delete-request", {
    method: "POST",
    body: JSON.stringify({ reason })
  });
}
