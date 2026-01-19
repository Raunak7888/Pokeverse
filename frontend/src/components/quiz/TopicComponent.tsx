"use client";

import clsx from "clsx";
import {
    Atom,
    Binary,
    Brain,
    Code,
    Gamepad2,
    LayoutGrid,
    Sparkles,
} from "lucide-react";

export type QuizKey =
    | "ALL"
    | "POKEMON"
    | "MATHS"
    | "PHYSICS"
    | "APTITUDE"
    | "COMPUTER_SCIENCE";

export const QUIZ_TYPES = [
    {
        key: "ALL",
        label: "All Topics",
        description: "Can you perform all categories?",
        icon: <LayoutGrid className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />,
        color: "from-purple-500 to-pink-600",
    },
    {
        key: "POKEMON",
        label: "Pokémon",
        description: "Master the Pokédex and evolutions",
        icon: <Gamepad2 className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />,
        color: "from-rose-500 to-red-600",
    },
    {
        key: "MATHS",
        label: "Mathematics",
        description: "Solve logic, numbers, and patterns",
        icon: <Binary className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />,
        color: "from-blue-500 to-indigo-600",
    },
    {
        key: "PHYSICS",
        label: "Physics",
        description: "Forces, motion, and the universe",
        icon: <Atom className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />,
        color: "from-emerald-500 to-teal-600",
    },
    {
        key: "APTITUDE",
        label: "Aptitude",
        description: "Test your reasoning and problem-solving skills",
        icon: <Brain className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />,
        color: "from-yellow-400 to-orange-500",
    },
    {
        key: "COMPUTER_SCIENCE",
        label: "Computer Science",
        description: "Programming, algorithms, and data structures",
        icon: <Code className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />,
        color: "from-green-500 to-lime-600",
    },
] as const;

interface TopicComponentProps {
    onSelect: (key: QuizKey) => void;
}

export default function TopicComponent({ onSelect }: TopicComponentProps) {
    return (
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-10 py-12 sm:py-16 space-y-10">
            {/* Header */}
            <header className="text-center space-y-3 sm:space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    New Challenges Available
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground">
                    Select Your <span className="text-primary">Challenge</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
                    Pick a category to test your knowledge.
                </p>
            </header>

            {/* Cards Grid */}
            <div
                className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-4
          sm:gap-6
          lg:gap-8
        "
            >
                {QUIZ_TYPES.map((q) => (
                    <button
                        key={q.key}
                        onClick={() => onSelect(q.key)}
                        className={clsx(
                            "group relative flex flex-col items-center text-center",
                            "p-5 sm:p-6 lg:p-8 rounded-3xl",
                            "bg-background border border-slate-100 shadow-lg",
                            "transition-all duration-300",
                            "hover:-translate-y-1 hover:shadow-2xl",
                        )}
                    >
                        {/* Gradient Hover */}
                        <div
                            className={clsx(
                                "absolute inset-0 rounded-3xl",
                                "opacity-0 group-hover:opacity-100 transition-opacity",
                                "bg-gradient-to-br",
                                q.color,
                            )}
                        />

                        {/* Icon */}
                        <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-slate-400/20 group-hover:bg-white/20 transition mb-4 sm:mb-6">
                            {q.icon}
                        </div>

                        {/* Title */}
                        <h3 className="relative z-10 text-base sm:text-lg lg:text-xl font-bold text-foreground">
                            {q.label}
                        </h3>

                        {/* Description */}
                        <p className="relative z-10 text-xs sm:text-sm text-foreground/80 mt-1 sm:mt-2 max-w-[18rem]">
                            {q.description}
                        </p>
                    </button>
                ))}
            </div>
        </section>
    );
}
