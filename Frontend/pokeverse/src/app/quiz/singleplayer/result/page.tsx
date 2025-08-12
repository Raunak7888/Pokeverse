"use client";

import PokeButton from "@/components/PokemonButton";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PikachuLoader from "@/components/pikachuLoader";
// import Analysis from "@/components/analysis"; // Assuming it's default exported

const CompletedResult = () => {
  const searchParams = useSearchParams();
  const [loader, setLoader] = useState(false);

  const score = searchParams.get("score") || "0";
  const total = searchParams.get("total") || "0";
  const sessionId = searchParams.get("sessionId");
  const router = useRouter();
  
  const handleNavigation = async (type: "home" | "analysis") => {
    if (type === "home") {
      router.push("/quiz")
      return;
    }

    if (type === "analysis" && sessionId) {

      setLoader(true);
      try {
        const response = await fetch(`http://localhost:8083/api/analysis/${sessionId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch analysis");

        const analysisData = await response.json();
        localStorage.setItem("analysis", JSON.stringify(analysisData));

        router.push("/quiz/singleplayer/analysis")
        
      } catch (error) {
        console.error("Error fetching analysis:", error);
      } finally {
        setLoader(false);
      }
    }
  };

  // if (showAnalysis) return <Analysis />;

  return (
    <div className="flex flex-col items-center justify-center bg-black text-white p-4 min-h-screen shadow-lg">
      {loader && <PikachuLoader />}
      <div className="flex flex-col items-center space-y-6 w-full max-w-4xl bg-[#1e1e1e] p-6 md:p-10 rounded-[5vh] shadow-lg">
        <div className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl underline font-[Piedra] tracking-widest mt-10 md:mt-14 text-center">
          Hey you Completed the Quiz
        </div>
        <div className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl underline font-[Piedra] tracking-widest text-center">
          Well Done!!!
        </div>
        <div className="text-white text-lg sm:text-xl md:text-2xl font-[Piedra] tracking-widest text-center">
          You Scored {score} out of {total}
        </div>
        <div className="mt-10 md:mt-14 flex flex-col md:flex-row items-center justify-center gap-6">
          <PokeButton buttonName="Analysis" onClick={() => handleNavigation("analysis")} />
          <PokeButton buttonName="Home" onClick={() => handleNavigation("home")} />
        </div>
      </div>
    </div>
  );
};

export default CompletedResult;
