"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; // Make sure you've installed it: npm install js-cookie

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("http://localhost:8082/auth/success", {
          credentials: "include",
        });

        const data = await res.json();
        console.log("Logged in user:", data);

        // Store everything in cookies
        Cookies.set("user", JSON.stringify(data.user), {
          expires: 7,
          sameSite: "Lax",
        });
        Cookies.set("accessToken", data["access token"], {
          expires: 1,
          sameSite: "Lax",
        });
        Cookies.set("refreshToken", data["refresh token"], {
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

  return <div className="text-white">Logging in, please wait...</div>;
}
