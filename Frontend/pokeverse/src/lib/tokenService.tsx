"use client";

import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import api from "@/lib/api"; // <-- axios instance with withCredentials

export interface JwtPayload {
  exp: number;
  sub: string;
  userId: number;
}

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// -----------------
// Getters
// -----------------
export function getAccessToken(): string | null {
  return Cookies.get(ACCESS_TOKEN_KEY) || null;
}

export function getRefreshToken(): string | null {
  return Cookies.get(REFRESH_TOKEN_KEY) || null;
}

// -----------------
// Expiry helpers
// -----------------
export function getExpiry(token: string): number {
  const decoded = jwtDecode<JwtPayload>(token);
  return decoded.exp * 1000; // convert to ms
}

export function isExpiringSoon(token: string, thresholdSeconds = 10): boolean {
  const expiry = getExpiry(token);
  const now = Date.now();
  return expiry - now <= thresholdSeconds * 1000;
}

// -----------------
// Refresh logic
// -----------------
export async function refreshIfNeeded(): Promise<void> {
  const token = getAccessToken();
  const refreshToken = getRefreshToken();

  if (!token || !refreshToken) {
    console.warn("[tokenService] No tokens found in cookies.");
    return;
  }

  if (isExpiringSoon(token, 10)) {

    try {
      const res = await api.get(`/auth/refresh?refreshToken=${refreshToken}`);
      const { access_token, refresh_token } = res.data;

      Cookies.set(ACCESS_TOKEN_KEY, access_token, { secure: true, sameSite: "strict" });
      Cookies.set(REFRESH_TOKEN_KEY, refresh_token, { secure: true, sameSite: "strict" });

    } catch (err: any) {
      console.error("[tokenService] Refresh failed ❌", err.response?.data || err);
      Cookies.remove(ACCESS_TOKEN_KEY);
      Cookies.remove(REFRESH_TOKEN_KEY);
      if (typeof window !== "undefined") {
        window.location.href = "/auth"; // redirect to login
      }
    }
  }
}
