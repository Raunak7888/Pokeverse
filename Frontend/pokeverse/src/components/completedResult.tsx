"use client";

import PokeButton from "@/components/PokemonButton";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PikachuLoader from "@/components/pikachuLoader";
import backendUrl from "@/components/backendUrl";
import { motion } from "framer-motion";

const CompletedResult = () => {
  const searchParams = useSearchParams();
  const [loader, setLoader] = useState(false);

  const score = searchParams.get("score") || "0";
  const total = searchParams.get("total") || "0";
  const sessionId = searchParams.get("sessionId") || "";
  const router = useRouter();

  const handleNavigation = async (type: "home" | "analysis") => {
    if (type === "home") {
      router.push("/quiz");
      return;
    }

    if (type === "analysis" && sessionId) {
      const storedAnalysis = localStorage.getItem("analysis");

      if (storedAnalysis) {
        try {
          const parsed = JSON.parse(storedAnalysis);
          if (parsed?.sessionId?.toString() === sessionId.toString()) {
            router.push("/quiz/singleplayer/analysis");
            return;
          }
        } catch (err) {
          console.error("Error parsing stored analysis:", err);
        }
      }

      setLoader(true);
      try {
        const response = await fetch(
          backendUrl + `/quiz/api/analysis/${sessionId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch analysis");

        const analysisData = await response.json();
        localStorage.setItem("analysis", JSON.stringify(analysisData));

        router.push("/quiz/singleplayer/analysis");
      } catch (error) {
        console.error("Error fetching analysis:", error);
      } finally {
        setLoader(false);
      }
    }
  };

  return (

      <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0f0f0f] via-[#1a1a1a] to-black text-white overflow-hidden">
        {loader && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
            <PikachuLoader />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative flex flex-col items-center w-full max-w-4xl bg-[#1e1e1e]/90 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-2xl border-2 border-black z-10"
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-yellow-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>

          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-piedra tracking-widest text-center bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-transparent bg-clip-text drop-shadow-md"
          >
            🎉 Hey, You Completed the Quiz!
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-piedra text-center text-yellow-300 drop-shadow"
          >
            Well Done, Trainer!
          </motion.h2>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 text-4xl sm:text-5xl md:text-5xl font-lemon tracking-wide text-center text-yellow-400 drop-shadow-lg"
          >
            {score} / {total}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6"
          >
            <PokeButton
              buttonName="View Analysis"
              onClick={() => handleNavigation("analysis")}
              width={220}
            />
            <PokeButton
              buttonName="Back Home"
              onClick={() => handleNavigation("home")}
            />
          </motion.div>
        </motion.div>
      </div>
  );
};

export default CompletedResult;
