"use client";

import axios from "axios";
import backendUrl from "@/components/backendUrl";

// Axios instance with cookies enabled
const api = axios.create({
  baseURL: backendUrl + "/authentication",
  withCredentials: true, // ✅ ensures cookies (accessToken, refreshToken) are sent
});

// Logging interceptor (optional, helps debug)
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error("[api] Request error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("[api] Response error:", error.response?.status, error.response?.data || error);
    return Promise.reject(error);
  }
);

export default api;
