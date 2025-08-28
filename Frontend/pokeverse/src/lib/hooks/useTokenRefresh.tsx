"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import backendUrl from "@/components/backendUrl";
import { useRouter } from "next/navigation";

// --------------------
// Types
// --------------------
interface JwtPayload {
  sub: string;
  userId: number;
  iat: number;
  exp: number;
}

interface User {
  id: number;
  email: string;
  name: string;
  profilePicUrl: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

// --------------------
// Hook
// --------------------
const useTokenRefresh = () => {
  const router = useRouter();

  const [accessToken, setAccessToken] = useState<string | null>(
    Cookies.get("accessToken") || null
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    Cookies.get("refreshToken") || null
  );
  const [user, setUser] = useState<User | null>(
    Cookies.get("user") ? JSON.parse(decodeURIComponent(Cookies.get("user")!)) : null
  );

  // --------------------
  // Helper: check expiry
  // --------------------
  const isTokenExpiringSoon = (token: string): boolean => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp <= currentTime || decoded.exp - currentTime < 10;
    } catch (error) {
      console.error("[useTokenRefresh] Error decoding token:", error);
      return true; // assume expired if decoding fails
    }
  };

  // --------------------
  // Refresh API call
  // --------------------
  const refreshTokens = async () => {
    if (!refreshToken) {
      console.warn("[useTokenRefresh] No refresh token, redirecting to /auth");
      router.push("/auth");
      return;
    }

    try {
      const response = await axios.get<TokenResponse>(
        backendUrl + "/authentication/auth/refresh",
        {
          params: { refreshToken },
          withCredentials: true,
        }
      );

      const { access_token, refresh_token } = response.data;

      // Update state & cookies
      setAccessToken(access_token);
      setRefreshToken(refresh_token);

      Cookies.set("accessToken", access_token, {
        expires: 1 / 864, // ~100s for dev
        sameSite: "strict",
      });
      Cookies.set("refreshToken", refresh_token, {
        expires: 2, // 2 days
        sameSite: "strict",
      });

    } catch (error) {
      console.error("[useTokenRefresh] ❌ Refresh failed:", error);

      // Clear and redirect
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);

      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      Cookies.remove("user");

      router.push("/auth");
    }
  };

  // --------------------
  // On mount → check if tokens exist
  // --------------------
  useEffect(() => {
    if (!accessToken || !refreshToken) {
      console.warn("[useTokenRefresh] Missing token(s), redirecting to /auth");
      router.push("/auth");
    }
  }, []);

  // --------------------
  // Interval check
  // --------------------
  useEffect(() => {
    const interval = setInterval(() => {
      if (accessToken && isTokenExpiringSoon(accessToken)) {
        refreshTokens();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [accessToken, refreshToken]);

  return { accessToken, refreshToken, user };
};

export default useTokenRefresh;
