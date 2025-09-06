import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import backendUrl from "@/components/backendUrl";
import { useRouter } from "next/navigation";

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

  const isTokenExpiringSoon = (token: string): boolean => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp <= currentTime || decoded.exp - currentTime < 10;
    } catch (error) {
      console.error("[useTokenRefresh] Error decoding token:", error);
      return true;
    }
  };

  // ✅ Wrap in useCallback so it's stable
  const refreshTokens = useCallback(async () => {
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

      setAccessToken(access_token);
      setRefreshToken(refresh_token);

      Cookies.set("accessToken", access_token, {
        expires: 1 / 864,
        sameSite: "strict",
      });
      Cookies.set("refreshToken", refresh_token, {
        expires: 2,
        sameSite: "strict",
      });
    } catch (error) {
      console.error("[useTokenRefresh] ❌ Refresh failed:", error);

      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);

      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      Cookies.remove("user");

      router.push("/auth");
    }
  }, [refreshToken, router]); // ✅ dependencies

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      console.warn("[useTokenRefresh] Missing token(s), redirecting to /auth");
      router.push("/auth");
    }
  }, [accessToken, refreshToken, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (accessToken && isTokenExpiringSoon(accessToken)) {
        refreshTokens();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [accessToken, refreshTokens]);

  return { accessToken, refreshToken, user };
};

export default useTokenRefresh;
