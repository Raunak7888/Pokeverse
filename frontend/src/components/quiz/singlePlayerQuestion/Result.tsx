"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Trophy, ThumbsUp, Smile, Frown } from "lucide-react";
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
            <div className="flex items-center justify-center h-screen">
                <p className="text-xl text-muted-foreground">
                    No result found.
                </p>
            </div>
        );
    }

    const percentage = Math.round((result.correct / result.total) * 100);

    let message = "";
    let Icon = Smile;

    if (percentage === 100) {
        message = "Perfect!";
        Icon = Trophy;
    } else if (percentage >= 70) {
        message = "Great job!";
        Icon = ThumbsUp;
    } else if (percentage >= 40) {
        message = "Not bad, keep practicing!";
        Icon = Smile;
    } else {
        message = "Better luck next time";
        Icon = Frown;
    }

    return (
        <div className="flex items-center justify-center w-screen h-screen bg-background px-4">
            <Card className="relative rounded-3xl w-full max-w-2xl border-2 border-foreground bg-card text-card-foreground p-8 shadow-2xl">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-6 py-2 rounded-full shadow-lg text-xl sm:text-2xl font-bold">
                    Result
                </div>
                <CardHeader className="text-center space-y-2 mt-6">
                    <div className="flex flex-col items-center gap-2">
                        <Icon className="w-10 h-10 text-primary" />
                        <p className="text-muted-foreground font-lemon text-lg">
                            {message}
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="text-center mt-6 space-y-4">
                    <div className="text-2xl font-semibold font-lemon">
                        Score: {result.correct} / {result.total}
                    </div>
                </CardContent>
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 font-poetsen">
                    <Button
                        className="rounded-full px-6 py-3 text-lg bg-primary text-primary-foreground w-full sm:w-auto"
                        onClick={() => router.push("/quiz")}
                    >
                        Play Again
                    </Button>
                    <Button
                        className="rounded-full px-6 py-3 text-lg bg-secondary text-secondary-foreground w-full sm:w-auto"
                        onClick={() => router.push("/")}
                    >
                        Home
                    </Button>
                    <Button
                        className="rounded-full px-6 py-3 text-lg bg-secondary text-secondary-foreground w-full sm:w-auto"
                        onClick={() =>
                            router.push("/quiz/singleplayer/analysis")
                        }
                    >
                        Analysis
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default Result;
