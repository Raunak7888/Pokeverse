"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Trophy, Star, ThumbsUp, Frown, RotateCcw, BarChart3, Home } from "lucide-react";
import { QuizResult } from "@/components/utils/types";

const Result = () => {
    const [result, setResult] = useState<QuizResult | null>(null);
    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem("quizResult");
        if (stored) {
            setResult(JSON.parse(stored));
        }
    }, []);

    if (!result) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="animate-pulse text-muted-foreground font-medium">Loading results...</div>
            </div>
        );
    }

    const percentage = Math.round((result.correct / result.total) * 100);

    const getStatus = () => {
        if (percentage === 100) return { msg: "Perfect!", Icon: Trophy, color: "text-green-400", border: "border-green-500", bg: "bg-green-100" };
        if (percentage >= 70) return { msg: "Great Job!", Icon: Star, color: "text-yellow-500", border: "border-yellow-500", bg: "bg-yellow-50" };
        if (percentage >= 40) return { msg: "Well Done!", Icon: ThumbsUp, color: "text-blue-500", border: "border-blue-500", bg: "bg-blue-50" };
        return { msg: "Keep Trying!", Icon: Frown, color: "text-red-500", border: "border-red-500", bg: "bg-red-50" };
    };

    const status = getStatus();

    return (
        // Changed to min-h-screen and added vertical padding for mobile
        <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 pt-20">
            <Card className="w-full max-w-md rounded-4xl bg-background sm:max-w-xl overflow-hidden p-0">
                {/* Visual Header */}
                <div className={`${status.bg} ${status.color} py-5 flex flex-col items-center `}>
                    <status.Icon className="w-16 h-16 mb-2" strokeWidth={1.5} />
                    <h1 className="text-3xl font-black uppercase tracking-tight italic">{status.msg}</h1>
                </div>

                <CardContent className="p-6 sm:p-10">
                    {/* Score Circle */}
                    {/* <div className="flex justify-center mb-8">
                        <div className="relative flex items-center justify-center">
                            <svg className="w-32 h-32 sm:w-40 sm:h-40 -rotate-90">
                                <circle cx="50%" cy="50%" r="42%" fill="none" stroke="currentColor" strokeWidth="10" className="text-foreground" />
                                <circle 
                                    cx="50%" cy="50%" r="42%" fill="none" stroke="currentColor" strokeWidth="10" 
                                    strokeDasharray={`${percentage * 2.64} 264`} // Simplified circumference
                                    strokeLinecap="round"
                                    className={`${status.color} transition-all duration-1000`}
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-4xl font-black">{percentage}%</span>
                                <span className="text-[10px] uppercase font-bold text-foreground">Accuracy</span>
                            </div>
                        </div>
                    </div> */}
                    <div className="flex flex-col items-center mb-8">
                        <span className="text-sm font-bold text-foreground uppercase tracking-widest mb-1">Total Score</span>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-6xl font-black ${status.color}`}>{percentage}</span>
                            <span className={`text-2xl font-bold ${status.color}`}>%</span>
                        </div>
                    </div>

                    {/* Score Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="bg-green-300 p-4 rounded-3xl text-center ">
                            <p className="text-xs font-bold text-black uppercase mb-1">Correct</p>
                            <p className="text-2xl font-black text-black">{result.correct}</p>
                        </div>
                        <div className="bg-yellow-300 p-4 rounded-3xl text-center ">
                            <p className="text-xs font-bold text-black uppercase mb-1">Total</p>
                            <p className="text-2xl font-black text-black">{result.total}</p>
                        </div>
                    </div>

                    {/* Action Buttons: Stacked on mobile, side-by-side on desktop */}
                    <div className="space-y-3 font-bold">
                        <Button 
                            variant={"default"}
                            className="w-full h-14 rounded-2xl text-lg bg-primary/80 hover:bg-primary text-foreground"
                            onClick={() => router.push("/quiz")}
                        >
                            <RotateCcw className="mr-2 w-5 h-5" /> Play Again
                        </Button>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button 
                                variant="outline" 
                                className="h-14 rounded-2xl border-2 text-foreground "
                                onClick={() => router.push("/quiz/singleplayer/analysis")}
                            >
                                <BarChart3 className="mr-2 w-5 h-5" /> Analysis
                            </Button>
                            <Button 
                                variant="outline" 
                                className="h-14 rounded-2xl border-2 text-foreground"
                                onClick={() => router.push("/")}
                            >
                                <Home className="mr-2 w-5 h-5" /> Home
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Result;