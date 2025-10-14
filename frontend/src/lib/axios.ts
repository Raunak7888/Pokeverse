import axios from "axios";
import {jwtDecode} from "jwt-decode";
import { useAuthStore } from "@/store/useAuthStore";
import { BACKEND_URL } from "@/components/utils/backendUrl";

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

// Decode JWT and check expiry
function isTokenExpiringSoon(token: string, thresholdSeconds = 10): boolean {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp - now <= thresholdSeconds;
  } catch (err) {
    console.error("Failed to decode JWT:", err);
    return true; // force refresh if invalid
  }
}

// Attach accessToken and refresh proactively
api.interceptors.request.use(async (config) => {
  let accessToken = useAuthStore.getState().accessToken;
  const refreshToken = useAuthStore.getState().getRefreshToken();

  if (accessToken && refreshToken && isTokenExpiringSoon(accessToken)) {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/auth/refresh`,
        { refreshToken },
        { withCredentials: true }
      );
      const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = res.data;

      // update store and cookies
      useAuthStore.getState().setAuth(user, newAccessToken, newRefreshToken);

      accessToken = newAccessToken;
    } catch (err) {
      console.error("Token refresh failed:", err);
      useAuthStore.getState().clearAuth();
    }
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export default api;
