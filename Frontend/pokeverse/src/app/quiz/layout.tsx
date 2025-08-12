// src/app/quiz/layout.tsx
"use client";

import Navbar from "@/components/Navbar";
import { ReactNode } from "react";

export default function QuizLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen bg-[#1f1f1f]">
      <Navbar />

      <div className="w-full bg-[#0e0e0e] h-[91.3vh] rounded-lg overflow-hidden shadow-lg">
        {children}
      </div>
    </div>
  );
}
