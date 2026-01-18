"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Minus, Plus, ChevronLeft } from "lucide-react";
import { useSinglePlayerQuestionsStore } from "@/store/useSinglePlayerQuestionsStore";
import { useSinglePlayerSessionStore } from "@/store/useSinglePlayerSessionStore";
import { useAuthStore } from "@/store/useAuthStore";
import { customToast } from "@/lib/toast";
import api from "@/lib/axios";
import clsx from "clsx";
import TopicComponent, {
    QUIZ_TYPES,
    QuizKey,
} from "@/components/quiz/TopicComponent";

export default function SinglePlayer() {
    const [quizType, setQuizType] = useState<QuizKey | null>(null);
    const [difficulty, setDifficulty] = useState("ALL");
    const [rounds, setRounds] = useState(5);
    const [loading, setLoading] = useState(false);

    const user = useAuthStore((s) => s.user);
    const { setQuestions } = useSinglePlayerQuestionsStore();
    const { setSession } = useSinglePlayerSessionStore();
    const router = useRouter();

    const handleStart = async () => {
        if (!user?.id) return customToast.error("Login required.");
        if (!quizType) return customToast.error("Select a quiz type.");

        setLoading(true);
        try {
            const res = await api.post(
                "/v1/api/quiz/single-player/session/create",
                {
                    userId: user.id,
                    rounds,
                    difficulty: difficulty === "ALL" ? "all" : difficulty,
                    topic: quizType,
                }
            );
            const { questions, session } = res.data;
            setQuestions(questions);
            setSession(session);
            router.push("/quiz/singleplayer/question");
        } catch {
            customToast.error("Failed to start quiz.");
        } finally {
            setLoading(false);
        }
    };

    const selectedTopic = QUIZ_TYPES.find((q) => q.key === quizType);

    return (
        <div className="h-screen w-screen  bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100">
            <div className="h-full w-full flex items-center justify-center ">
                {!quizType ? (
                    <div className="pt-15">
                        <TopicComponent onSelect={setQuizType} />
                    </div>
                ) : (
                    /* STEP 2: CONFIGURATION (FIXED, NO SCROLL) */
                    <div className="w-full max-w-2xl pt-[7vh] animate-in fade-in zoom-in-95 duration-500">
                        <div className="bg-background rounded-3xl border border-foreground shadow-2xl p-10 space-y-10 max-h-[85vh] overflow-hidden">
                            {/* Back */}
                            <button
                                onClick={() => setQuizType(null)}
                                className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Change Category
                            </button>
                            {/* Header */}
                            <div className="flex items-center gap-6 border-b border-foreground pb-8">
                                <div
                                    className={clsx(
                                        "p-5 rounded-[2rem] text-foreground bg-gradient-to-br shadow-lg",
                                        selectedTopic?.color
                                    )}
                                >
                                    {selectedTopic?.icon}
                                </div>
                                <div>
                                    <h2 className="text-3xl text-primary font-black">
                                        {selectedTopic?.label}
                                    </h2>
                                    <p className="text-slate-500 italic">
                                        Configure your quiz
                                    </p>
                                </div>
                            </div>
                            {/* Difficulty */}
                            <div className="space-y-2">
                                <Label className="text-lg text-foreground font-bold">
                                    Difficulty
                                </Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {["ALL", "EASY", "MEDIUM", "HARD"].map(
                                        (d) => (
                                            <button
                                                key={d}
                                                onClick={() => setDifficulty(d)}
                                                className={clsx(
                                                    "h-12 rounded-2xl text-foreground font-bold border-2 transition",
                                                    difficulty === d
                                                        ? "bg-primary border-primary text-white"
                                                        : "border-foreground hover:border-foreground/70"
                                                )}
                                            >
                                                {d}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                            {/* Rounds */}
                            <div className="space-y-2">
                                <Label className="text-lg text-foreground font-bold">
                                    Number of Questions
                                </Label>
                                <div className="flex items-center justify-between p-4 border border-foreground rounded-2xl">
                                    <Button
                                        size="icon"
                                        onClick={() =>
                                            setRounds((r) => Math.max(5, r - 5))
                                        }
                                        disabled={rounds <= 5}
                                    >
                                        <Minus />
                                    </Button>
                                    <span className="text-4xl font-black text-primary">
                                        {rounds}
                                    </span>
                                    <Button
                                        size="icon"
                                        onClick={() =>
                                            setRounds((r) =>
                                                Math.min(20, r + 5)
                                            )
                                        }
                                        disabled={rounds >= 20}
                                    >
                                        <Plus />
                                    </Button>
                                </div>
                            </div>
                            <Button
                                onClick={handleStart}
                                disabled={loading}
                                className="w-full h-16 text-xl font-black rounded-2xl bg-gradient-to-r from-primary to-indigo-600"
                            >
                                {loading ? "Initializing..." : "Launch Quiz"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
