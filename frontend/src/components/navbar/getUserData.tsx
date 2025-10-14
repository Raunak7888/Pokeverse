// lib/auth.ts
import api from "@/lib/axios";
import { BACKEND_URL } from "../utils/backendUrl";
import { useAuthStore } from "@/store/useAuthStore";

export async function getUserData(token: string) {
  try {
    console.log("Fetching /users/me with token:", token);
    
    // Clean token (remove Bearer prefix if present)
    const cleanToken = token.replace(/^Bearer\s+/i, '');
    
    const res = await api.get(`${BACKEND_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
      },
    });
    
    console.log("Response from /users/me:", res.data);
    
    if (!res.data) return null;
    
    return {
      id: res.data.id,
      name: res.data.username,
      email: res.data.email,
      image: res.data.profilePictureUrl,
    };
  } catch (err) {
    console.error("Failed to fetch user data:", err);
    // If token is invalid, you might want to clear auth here
    useAuthStore.getState().clearAuth();
    return null;
  }
}