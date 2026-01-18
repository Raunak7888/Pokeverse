"use client";

import clsx from "clsx";
import { Atom, Binary, Brain, Code, Gamepad2, LayoutGrid, Sparkles } from "lucide-react";

export type QuizKey = "ALL" | "POKEMON" | "MATHS" | "PHYSICS" | "APTITUDE" | "COMPUTER_SCIENCE";

// type QuizType = {
//     key: QuizKey;
//     label: string;
//     description: string;
//     icon: React.ReactNode;
//     color: string;
// };

export const QUIZ_TYPES = [
    {
        key: "ALL",
        label: "All Topics",
        description: "Can you perform all categories?",
        icon: <LayoutGrid className="w-10 h-10" />,
        color: "from-purple-500 to-pink-600",
    },
    {
        key: "POKEMON",
        label: "Pokémon",
        description: "Master the Pokédex and evolutions",
        icon: <Gamepad2 className="w-10 h-10" />,
        color: "from-rose-500 to-red-600",
    },
    {
        key: "MATHS",
        label: "Mathematics",
        description: "Solve logic, numbers, and patterns",
        icon: <Binary className="w-10 h-10" />,
        color: "from-blue-500 to-indigo-600",
    },
    {
        key: "PHYSICS",
        label: "Physics",
        description: "Forces, motion, and the universe",
        icon: <Atom className="w-10 h-10" />,
        color: "from-emerald-500 to-teal-600",
    },
    {
        key: "APTITUDE",
        label: "Aptitude",
        description: "Test your reasoning and problem-solving skills",
        icon: <Brain className="w-10 h-10" />,
        color: "from-yellow-400 to-orange-500",
    },
    {
        key: "COMPUTER_SCIENCE",
        label: "Computer Science",
        description: "Programming, algorithms, and data structures",
        icon: <Code className="w-10 h-10" />,
        color: "from-green-500 to-lime-600",
    }
] as const;

interface TopicComponentProps {
    onSelect: (key: QuizKey) => void;
}

export default function TopicComponent({
    onSelect,
}: TopicComponentProps) {
    return (
        <div className="max-w-4xl pt-15 w-full space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    New Challenges Available
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-foreground">
                    Select Your{" "}
                    <span className="text-primary">Challenge</span>
                </h1>

                <p className="text-slate-500">
                    Pick a category to test your knowledge.
                </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 mx-20 md:mx-0 gap-8 pb-6">
                {QUIZ_TYPES.map((q) => (
                    <button
                        key={q.key}
                        onClick={() => onSelect(q.key)}
                        className={clsx(
                            "group relative flex flex-col items-center p-8 rounded-[2.5rem]",
                            "bg-background border border-slate-100 shadow-xl",
                            "transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                        )}
                    >
                        <div
                            className={clsx(
                                "absolute inset-0 rounded-[2.5rem]",
                                "opacity-0 group-hover:opacity-100 transition-opacity",
                                "bg-gradient-to-br",
                                q.color
                            )}
                        />

                        <div className="relative z-10 p-5 rounded-3xl bg-slate-400 group-hover:bg-white/20 transition mb-6">
                            {q.icon}
                        </div>

                        <h3 className="relative z-10 text-xl font-bold text-foreground">
                            {q.label}
                        </h3>

                        <p className="relative z-10 text-sm text-center text-foreground/80 mt-2">
                            {q.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}
