import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "@/store/useAuthStore";
import { BACKEND_URL } from "@/components/utils/backendUrl";

/* --------------------------------------------------
    Axios instance
-------------------------------------------------- */
const api = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
});

/* --------------------------------------------------
    Refresh control (prevents refresh storms)
-------------------------------------------------- */
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

/* --------------------------------------------------
    Token expiry check
-------------------------------------------------- */
function isTokenExpiringSoon(token: string, thresholdSeconds = 15): boolean {
    try {
        const { exp } = jwtDecode<{ exp: number }>(token);
        const now = Date.now() / 1000;
        return exp - now < thresholdSeconds;
    } catch {
        return true;
    }
}

/* --------------------------------------------------
    Refresh access token
-------------------------------------------------- */
async function refreshAccessToken(): Promise<string> {
    const { getRefreshToken, setAuth, clearAuth } = useAuthStore.getState();

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        clearAuth();
        throw new Error("No refresh token");
    }

    try {
        const res = await axios.post(
            `${BACKEND_URL}/api/auth/refresh`,
            { refreshToken },
            { withCredentials: true }
        );

        const {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user,
        } = res.data;

        setAuth(user, newAccessToken, newRefreshToken);
        return newAccessToken;
    } catch (err) {
        clearAuth();
        throw err;
    }
}

/* --------------------------------------------------
    Request interceptor (FIXED TYPES)
-------------------------------------------------- */
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const authStore = useAuthStore.getState();
        let accessToken = authStore.accessToken;

        if (accessToken && isTokenExpiringSoon(accessToken)) {
            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = refreshAccessToken().finally(() => {
                    isRefreshing = false;
                });
            }

            try {
                accessToken = await refreshPromise!;
            } catch {
                return Promise.reject("Session expired");
            }
        }

        if (accessToken) {
            // IMPORTANT: Axios v1 requires using set()
            config.headers.set("Authorization", `Bearer ${accessToken}`);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/* --------------------------------------------------
    Response interceptor
-------------------------------------------------- */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().clearAuth();
        }
        return Promise.reject(error);
    }
);

export default api;
