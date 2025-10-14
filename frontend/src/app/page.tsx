"use client";

import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { WelcomeSection } from "@/components/home/WelcomeSection";
import { GamesSection } from "@/components/home/GamesSection";

export default function Home() {
  const user = useAuthStore((state) => state.user);
  

  return (
    <main className="min-h-screen  flex flex-col items-center justify-center bg-background">
      <WelcomeSection user={user} />
      <GamesSection />
    </main>
  );
}
