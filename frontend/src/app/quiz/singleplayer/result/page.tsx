"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import Result from "@/components/quiz/singlePlayerQuestion/Result";

export default function SinglePlayerResultPage() {
    useEffect(() => {
        const duration = 3 * 1000;
        const end = Date.now() + duration;
        const colors = ["#ee4035", "#ffffff","#2b7fff"];

        (function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors,
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors,
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        })();
    }, []); // Empty dependency array means this runs once on mount

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-background">
            <Result />
        </div>
    );
}
