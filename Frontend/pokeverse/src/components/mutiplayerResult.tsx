"use client";

import React, { useEffect, useState } from "react";

const MultiplayerResult = ({
  endTime,
  correct = true,
}: {
  endTime: number;
  correct?: boolean;
}) => {
  const [now, setNow] = useState(Date.now());

  // 🎥 Smooth clock updates with requestAnimationFrame
  useEffect(() => {
    let frameId: number;

    const tick = () => {
      setNow(Date.now());
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const remaining = Math.max(0, endTime - now);

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const total = 30_000; // assume 30s rounds
  const progress = (remaining / total) * circumference;

  return (
    <div className="bg-[#1e1e1e] flex items-center ml-9 justify-center flex-col text-white rounded-3xl p-8 w-[50vw] h-[66vh] shadow-2xl font-piedra tracking-widest">
      <div
        className={`text-7xl font-extrabold mb-6 ${
          correct ? "text-[#2CC30A]" : "text-red-500"
        }`}
      >
        {correct ? "Correct Answer !!!" : "Oops! Wrong Answer"}
      </div>

      <div
        className={`text-6xl font-extrabold mb-6 ${
          correct ? "text-[#2CC30A]" : "text-red-400"
        }`}
      >
        {correct ? "Well Done !!!" : "Better Luck Next Time"}
      </div>

      <div className="text-xl font-extrabold text-white mb-6 text-left">
        Waiting For Other Players to Finish...
      </div>

      {/* Countdown Clock */}
      <div className="flex flex-row items-center justify-center gap-6 mt-8">
        <div className="text-2xl font-bold text-white">
          Next round begins in:
        </div>

        <div className="relative w-[100px] h-[100px]">
          <svg width="100" height="100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#444"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={correct ? "#2CC30A" : "#ef4444"}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{
                transition: "stroke-dashoffset 0.1s linear", // smooth transition
              }}
            />
          </svg>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xl text-[#2CC30A]">
            {Math.ceil(remaining / 1000)}s
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerResult;
