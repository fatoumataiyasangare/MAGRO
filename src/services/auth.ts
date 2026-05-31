import { apiFetch, clearStoredAccessToken, setStoredAccessToken } from "./api";

export type UserRole = "BUYER" | "FARMER" | "REGULATOR";

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
}

export async function requestOtp(phone: string) {
  return apiFetch<{ message: string }>("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ phone })
  });
}

export async function verifyOtp(phone: string, otp: string) {
  const payload = await apiFetch<{ user: UserProfile; accessToken: string }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otp })
  });

  setStoredAccessToken(payload.accessToken);
  return payload;
}

export async function fetchProfile() {
  return apiFetch<UserProfile>("/profile");
}

export async function logout() {
  clearStoredAccessToken();
  return apiFetch<{ message: string }>("/auth/logout", {
    method: "POST"
  });
}

export async function updateRole(role: UserRole) {
  return apiFetch<UserProfile>("/profile/role", {
    method: "PATCH",
    body: JSON.stringify({ role })
  });
}
