"use client";
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Tooltip as ShadcnTooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import {
    Trophy,
    Timer,
    CheckCircle2,
    XCircle,
    Target,
    Zap,
    Calendar,
} from "lucide-react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import { QuestionAttempt } from "@/components/utils/types";
import { useSinglePlayerSessionStore } from "@/store/useSinglePlayerSessionStore";
import { useAnalysisStore } from "@/store/useSinglePlayerAnaylsisStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const COLORS = ["#22c55e", "#ee4035"]; // success green & primary red

export default function QuizAnalysisDashboard() {
    const sessionId = useSinglePlayerSessionStore().session?.sessionId;

    const { analysis, loading, error, fetchAnalysis } = useAnalysisStore();
    const router = useRouter();

    // fetch only if sessionId changed or no analysis present
    useEffect(() => {
        if (!sessionId) return;

        if (!analysis || analysis.sessionId !== sessionId) {
            fetchAnalysis(`${sessionId}`);
        }
    }, [sessionId, analysis, fetchAnalysis]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Loading analysis...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>No analysis available</p>
            </div>
        );
    }

    // transform data for charts
    let cumulativeScore = 0;
    const initialData = [{ questionNo: 0, performance: 0 }];
    const scoreProgression = analysis.questionAttempts.map(
        (q: QuestionAttempt, index: number) => {
            if (q.correct) cumulativeScore += 1;
            return { questionNo: index + 1, performance: cumulativeScore };
        }
    );
    const lineData = [...initialData, ...scoreProgression];

    const chartData = [
        { name: "Correct", value: analysis.correctAnswers },
        { name: "Wrong", value: analysis.wrongAnswers },
    ];

    const getScoreColor = (accuracy: number) => {
        if (accuracy >= 80) return "text-success";
        if (accuracy >= 60) return "text-yellow";
        return "text-primary";
    };

    return (
        <div
            className="min-h-screen mt-15 p-4 lg:p-6"
            style={{
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
            }}
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="grid grid-cols-1 gap-6 mb-6 text-center">
                    <h1
                        className="text-2xl lg:text-4xl font-bold"
                        style={{ color: "var(--foreground)" }}
                    >
                        Quiz Analysis Dashboard
                    </h1>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-2xl mx-auto">
                        {[
                            {
                                icon: Calendar,
                                value: new Date(
                                    analysis.createdAt
                                ).toLocaleDateString(),
                                label: "Quiz Date",
                            },
                            {
                                icon: Target,
                                value:
                                    analysis.difficulty === ""
                                        ? "All difficulty"
                                        : analysis.difficulty,
                                label: "Difficulty",
                            },
                            {
                                icon: Zap,
                                value: analysis.topic === "" ? "General" : analysis.topic[0].toUpperCase() + analysis.topic.slice(1),
                                label: "Quiz Type",
                            },
                        ].map((item, idx) => (
                            <ShadcnTooltip key={idx}>
                                <TooltipTrigger asChild>
                                    <div
                                        className="flex items-center justify-center gap-1 text-sm border-2 rounded-lg p-2 cursor-pointer"
                                        style={{
                                            borderColor: "var(--foreground)",
                                        }}
                                    >
                                        <item.icon
                                            size={16}
                                            style={{ color: "var(--yellow)" }}
                                        />
                                        <span>{item.value}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <span>{item.label}</span>
                                </TooltipContent>
                            </ShadcnTooltip>
                        ))}
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6 h-[calc(100vh-200px)]">
                    {/* Score */}
                    <Card
                        className="md:col-span-1 lg:col-span-2 border-2"
                        style={{
                            borderColor: "var(--foreground)",
                            backgroundColor: "var(--background)",
                        }}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Trophy
                                    size={20}
                                    style={{ color: "var(--yellow)" }}
                                />
                                Overall Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div
                                className={`text-4xl lg:text-5xl font-bold ${getScoreColor(
                                    analysis.accuracy
                                )}`}
                            >
                                {analysis.correctAnswers}/
                                {analysis.totalQuestions}
                            </div>
                            <Progress
                                value={analysis.accuracy}
                                className="h-3 bg-white/20"
                            />
                            <div className="flex justify-between text-sm">
                                <span className="text-foreground/70">
                                    Accuracy
                                </span>
                                <span
                                    className={`font-semibold ${getScoreColor(
                                        analysis.accuracy
                                    )}`}
                                >
                                    {analysis.accuracy}%
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Time Metrics */}
                    <Card
                        className="md:col-span-1 lg:col-span-2 border-2"
                        style={{
                            borderColor: "var(--foreground)",
                            backgroundColor: "var(--background)",
                        }}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Timer
                                    size={20}
                                    style={{ color: "var(--yellow)" }}
                                />
                                Time Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div
                                        className="text-2xl font-bold"
                                        style={{ color: "var(--success)" }}
                                    >
                                        {analysis.totalDuration / 1000}s
                                    </div>
                                    <div className="text-xs">Total Time</div>
                                </div>
                                <div>
                                    <div
                                        className="text-2xl font-bold"
                                        style={{ color: "var(--success)" }}
                                    >
                                        {analysis.averageTimePerQuestion / 1000}
                                        s
                                    </div>
                                    <div className="text-xs">Avg/Question</div>
                                </div>
                                <div>
                                    <div
                                        className="text-lg font-semibold"
                                        style={{ color: "var(--success)" }}
                                    >
                                        {analysis.fastestAnswerTime / 1000}s
                                    </div>
                                    <div className="text-xs">Fastest</div>
                                </div>
                                <div>
                                    <div
                                        className="text-lg font-semibold"
                                        style={{ color: "var(--primary)" }}
                                    >
                                        {analysis.slowestAnswerTime / 1000}s
                                    </div>
                                    <div className="text-xs">Slowest</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Rating */}
                    <Card
                        className="md:col-span-2 lg:col-span-2 border-2"
                        style={{
                            borderColor: "var(--foreground)",
                            backgroundColor: "var(--background)",
                        }}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Zap
                                    size={20}
                                    style={{ color: "var(--yellow)" }}
                                />
                                Performance Rating
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div
                                        className="text-2xl font-bold"
                                        style={{ color: "var(--success)" }}
                                    >
                                        {analysis.performanceRating}
                                    </div>
                                    <div className="text-xs">
                                        Overall Rating
                                    </div>
                                </div>
                                <div>
                                    <div
                                        className="text-2xl font-bold"
                                        style={{ color: "var(--yellow)" }}
                                    >
                                        {analysis.answerSpeedRating}
                                    </div>
                                    <div className="text-xs">Speed Rating</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Answer Distribution */}
                    <Card
                        className="md:col-span-2 lg:col-span-3 border-2"
                        style={{
                            borderColor: "var(--foreground)",
                            backgroundColor: "var(--background)",
                        }}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle>Answer Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor:
                                                "var(--background)",
                                            border: `1px solid var(--foreground)`,
                                            borderRadius: "8px",
                                        }}
                                        itemStyle={{
                                            color: "var(--foreground)",
                                        }}
                                        formatter={(value, name) => [
                                            value,
                                            name,
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Score Progression */}
                    <Card
                        className="md:col-span-2 lg:col-span-3 border-2"
                        style={{
                            borderColor: "var(--foreground)",
                            backgroundColor: "var(--background)",
                        }}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle>Score Progression</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={lineData}>
                                    <CartesianGrid
                                        strokeDasharray="4 4"
                                        stroke="var(--foreground)"
                                    />
                                    <XAxis
                                        dataKey="questionNo"
                                        stroke="var(--foreground)"
                                        fontSize={12}
                                        domain={[0, analysis.totalQuestions]}
                                    />
                                    <YAxis
                                        stroke="var(--foreground)"
                                        fontSize={12}
                                        domain={[0, analysis.totalQuestions]}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor:
                                                "var(--background)",
                                            border: `1px solid var(--foreground)`,
                                            borderRadius: "8px",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="performance"
                                        stroke="var(--yellow)"
                                        strokeWidth={3}
                                        dot={{ fill: "var(--yellow)", r: 4 }}
                                        activeDot={{
                                            r: 6,
                                            fill: "var(--yellow)",
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Question Details */}
                    <Card
                        className="md:col-span-2 lg:col-span-6 border-2"
                        style={{
                            borderColor: "var(--foreground)",
                            backgroundColor: "var(--background)",
                        }}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle>Question Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-60 overflow-y-auto scrollbar-thumb-foreground/60
                                            scrollbar-track-foreground/10
                                            hover:scrollbar-thumb-foreground/80
                                            [&::-webkit-scrollbar]:w-1.5
                                            [&::-webkit-scrollbar-track]:rounded-full
                                            [&::-webkit-scrollbar-track]:bg-foreground/10
                                            [&::-webkit-scrollbar-thumb]:rounded-full
                                            [&::-webkit-scrollbar-thumb]:bg-foreground/60
                                            hover:[&::-webkit-scrollbar-thumb]:bg-foreground/80 ">
                                <div className="grid grid-cols-1 md:grid-cols-2  gap-3 p-4">
                                    {analysis.questionAttempts.map((q, idx) => (
                                        <div
                                            key={q.id}
                                            className={`rounded-lg p-3 transition-colors border-l-4 hover:bg-foreground/20`}
                                            style={{
                                                borderColor: q.correct
                                                    ? "var(--success)"
                                                    : "var(--primary)",
                                            }}
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium">{`Q${
                                                        idx + 1
                                                    }`}</span>
                                                    {q.correct ? (
                                                        <CheckCircle2
                                                            size={16}
                                                            style={{
                                                                color: "var(--success)",
                                                            }}
                                                        />
                                                    ) : (
                                                        <XCircle
                                                            size={16}
                                                            style={{
                                                                color: "var(--primary)",
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <p className="text-sm line-clamp-2 min-h-10">
                                                    {q.question}
                                                </p>
                                                <div className="rounded px-2 py-1 bg-foreground/10">
                                                    <p className="text-xs truncate">
                                                        Your answer was{" "}
                                                        {q.selectedAnswer}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="fixed bottom-6 right-6 flex gap-4 z-50">
                <Button
                    className="rounded-full px-6 py-3 text-lg bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
                    onClick={() => router.push("/quiz")}
                >
                    Play Again
                </Button>
                <Button
                    className="rounded-full px-6 py-3 text-lg bg-secondary text-secondary-foreground shadow-lg hover:scale-105 transition-transform"
                    onClick={() => router.push("/")}
                >
                    Home
                </Button>
            </div>
        </div>
    );
}
