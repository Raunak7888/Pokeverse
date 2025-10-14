import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { AuthState, User } from "@/components/utils/types";

export const useAuthStore = create<AuthState & {
  getUser: () => User | null;
  getToken: () => string | null;
  getRefreshToken: () => string | null;
  isAuthenticated: () => boolean;
  loadFromCookies: () => void;
}>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      
      setAuth: (user, accessToken, refreshToken) => {
        // Clean token (remove "Bearer " if present)
        const cleanToken = accessToken.replace(/^Bearer\s+/i, '');
        
        set({ user, accessToken: cleanToken });
        
        // Also set cookies as backup
        Cookies.set("user", JSON.stringify(user), { expires: 7 });
        Cookies.set("accessToken", cleanToken, { expires: 1 }); // short lived
        Cookies.set("refreshToken", refreshToken, { expires: 7 });
        
        console.log("Auth set successfully:", { user: user.name, hasToken: !!cleanToken });
      },
      
      clearAuth: () => {
        set({ user: null, accessToken: null });
        Cookies.remove("user");
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        console.log("Auth cleared");
      },
      
      loadFromCookies: () => {
        const userCookie = Cookies.get("user");
        const accessTokenCookie = Cookies.get("accessToken");
        
        console.log("Loading from cookies:", { 
          hasUser: !!userCookie, 
          hasToken: !!accessTokenCookie 
        });
        
        // If we have both user and token, load both
        if (userCookie && accessTokenCookie) {
          try {
            const user = JSON.parse(userCookie);
            const cleanToken = accessTokenCookie.replace(/^Bearer\s+/i, '');
            set({
              user,
              accessToken: cleanToken,
            });
            console.log("Loaded user and token from cookies:", user.name);
          } catch (err) {
            console.error("Error parsing user cookie:", err);
            // Clear invalid user cookie but keep token
            Cookies.remove("user");
          }
        } 
        // If we only have token (no user), load just the token
        else if (accessTokenCookie && !userCookie) {
          const cleanToken = accessTokenCookie.replace(/^Bearer\s+/i, '');
          set({
            user: null, // Explicitly set to null
            accessToken: cleanToken,
          });
          console.log("Loaded token from cookies, user will be fetched from API");
        }
        // If we only have user but no token, clear everything
        else if (userCookie && !accessTokenCookie) {
          console.log("Found user cookie but no token, clearing user cookie");
          Cookies.remove("user");
          set({ user: null, accessToken: null });
        }
        else {
          console.log("No auth cookies found");
        }
      },
      
      // Helper functions - these should NOT be used in useEffect dependencies
      getUser: () => {
        return get().user;
      },
      
      getToken: () => {
        return get().accessToken;
      },
      
      getRefreshToken: () => {
        return Cookies.get("refreshToken") ?? null;
      },
      
      isAuthenticated: () => {
        return !!get().accessToken;
      },
      
    }),
    {
      name: 'auth-storage', // unique name for localStorage
      partialize: (state) => ({ 
        user: state.user, 
        accessToken: state.accessToken 
      }),
      // Load persisted state immediately
      onRehydrateStorage: () => (state) => {
        console.log("Zustand rehydrated:", { 
          hasUser: !!state?.user, 
          hasToken: !!state?.accessToken 
        });
      },
    }
  )
);