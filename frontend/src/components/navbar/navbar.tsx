"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserData } from "./getUserData";
import DesktopNavLinks from "./DesktopNavLinks";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const fetchingRef = useRef(false); // Prevent multiple API calls

    // Use Zustand store directly
    const { user, setAuth, loadFromCookies } = useAuthStore();

    // Initialize auth state from cookies/localStorage on mount
    useEffect(() => {
        const initializeAuth = async () => {
            // First, handle URL params (OAuth redirect)
            const url = new URL(window.location.href);
            const userParam = url.searchParams.get("user");
            const token = url.searchParams.get("token");
            const refreshToken = url.searchParams.get("refreshToken");

            if (userParam && token && refreshToken) {
                try {
                    const match = userParam.match(/UserDto\[(.*?)\]/);
                    if (match) {
                        const parts = match[1].split(",").map((p) => p.trim());
                        const userObj: {
                            id?: string;
                            username?: string;
                            email?: string;
                            profilePictureUrl?: string;
                        } = {};

                        parts.forEach((p) => {
                            const [key, val] = p.split("=");
                            if (key && val) {
                                switch (key.trim()) {
                                    case "id":
                                        userObj.id = val.trim();
                                        break;
                                    case "username":
                                        userObj.username = val.trim();
                                        break;
                                    case "email":
                                        userObj.email = val.trim();
                                        break;
                                    case "profilePictureUrl":
                                        userObj.profilePictureUrl = val.trim();
                                        break;
                                }
                            }
                        });

                        const parsedUser = {
                            id: Number(userObj.id ?? 0),
                            name: userObj.username ?? "",
                            email: userObj.email ?? "",
                            image: userObj.profilePictureUrl ?? "",
                        };

                        setAuth(parsedUser, token, refreshToken);
                        window.history.replaceState({}, document.title, "/");
                        setIsInitialized(true);
                        return; // Exit early, we have user data
                    }
                } catch (err) {
                    console.error("Failed to parse user param:", err);
                }
            }

            // If no URL params, load from cookies/localStorage
            loadFromCookies();
            setIsInitialized(true);
        };

        initializeAuth();
    }, [loadFromCookies, setAuth]); // Run only once on mount

    // Fetch user data from API if we have token but no user data
    useEffect(() => {
        if (!isInitialized || fetchingRef.current) return;

        const fetchUserFromAPI = async () => {
            const currentState = useAuthStore.getState();
            const token = currentState.getToken();
            const currentUser = currentState.user;

            console.log("Checking if should fetch user:", {
                hasToken: !!token,
                hasUser: !!currentUser,
                isInitialized,
            });

            // Only fetch if we have token but no user data
            if (!token || currentUser) {
                console.log("Skipping API fetch:", {
                    reason: !token ? "no token" : "user already exists",
                });
                return;
            }

            fetchingRef.current = true;
            console.log("Fetching user data from API...");

            try {
                const userData = await getUserData(token);
                if (userData) {
                    const refreshToken = currentState.getRefreshToken() ?? "";
                    setAuth(userData, token, refreshToken);
                    console.log(
                        "Successfully fetched and set user data:",
                        userData.name
                    );
                } else {
                    console.log("API returned no user data");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                fetchingRef.current = false;
            }
        };

        fetchUserFromAPI();
    }, [isInitialized, user, setAuth]);

    // Auto-close mobile menu after login
    useEffect(() => {
        if (user && menuOpen) setMenuOpen(false);
    }, [user, menuOpen]);

    return (
        <nav className="w-full flex items-center justify-between px-6 py-3 fixed top-0 left-0 z-50 bg-[#EE4035]">
            <h1
                className="md:text-3xl text-2xl font-bold text-white font-krona tracking-wide cursor-pointer"
                onClick={() => router.push("/")}
            >
                Pokeverse
            </h1>
            <DesktopNavLinks user={user} />
            <MobileMenu
                user={user}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
            />
        </nav>
    );
}
