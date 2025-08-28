"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; // Make sure you've installed it: npm install js-cookie
import backendUrl from "@/components/backendUrl";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(backendUrl+"/authentication/auth/success", {
          credentials: "include",
        });

        const data = await res.json();
        // Store everything in cookies
        Cookies.set("user", JSON.stringify(data.user), {
          expires: 7,
          sameSite: "Lax",
        });
        Cookies.set("accessToken", data["access_token"], {
          expires: 1,
          sameSite: "Lax",
        });
        Cookies.set("refreshToken", data["refresh_token"], {
          expires: 7,
          sameSite: "Lax",
        });

        // Redirect to home/dashboard
        router.push("/quiz");
      } catch (error) {
        console.error("Error fetching user after login:", error);
      }
    }

    fetchUser();
  }, []);

  return <div className="text-white text-center w-screen h-screen">Logging in, please wait...</div>;
}
