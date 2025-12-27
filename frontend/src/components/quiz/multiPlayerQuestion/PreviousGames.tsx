import { useMultiplayerRStore } from "@/store/useMultiplayerResult";
import { motion } from "framer-motion";
import { ChevronDown, History } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useMemo } from "react";

export interface PlayerResult {
    id: number;
    name: string;
    score: number;
    accuracy: number;
    streak: number;
    avatar: string;
}

export interface RoomResult {
    players: PlayerResult[];
    currentUser: PlayerResult;
    userRank: number;
    fetchedAt: number;
}

export interface MultiplayerCacheState {
    resultsByRoom: Record<string, RoomResult>;
    roomOrder: string[];
    loading: boolean;
}

export interface MatchHistoryEntry {
    roomId: string;
    date: string;
    isWin: boolean;
    userRank: number;
    totalPlayers: number;
    score: number;
    accuracy: number;
    streak: number;
}

interface MatchCardProps {
    match: MatchHistoryEntry;
}

const MatchHistoryCard: React.FC<MatchCardProps> = ({ match }) => {
    const {
        isWin,
        userRank,
        totalPlayers,
        score,
        accuracy,
        streak,
        date,
        roomId,
    } = match;
    const router = useRouter();

    const onClick = () => {
        router.push(`/quiz/multiplayer/result/${roomId}`);
    };

    const accent = isWin ? "from-emerald-500/30" : "from-rose-500/30";

    return (
        <div className="group relative overflow-hidden rounded-xl bg-neutral-900/70 hover:bg-neutral-800/80 transition-all">
            {/* Accent strip */}
            <div
                className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${accent} to-transparent`}
            />

            <div className="flex items-center justify-between px-6 py-4 pl-7">
                {/* Result */}
                <div>
                    <div
                        className={`text-sm font-semibold tracking-wide ${
                            isWin ? "text-emerald-400" : "text-rose-400"
                        }`}
                    >
                        {isWin ? "VICTORY" : "DEFEAT"}
                    </div>
                    <div className="text-xs text-neutral-400">
                        Rank #{userRank}/{totalPlayers}
                    </div>
                </div>

                {/* Score */}
                <div className="text-center">
                    <div className="text-3xl font-bold text-white leading-none">
                        {score}
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">Score</div>
                </div>

                {/* Stats */}
                <div className="text-right text-xs text-neutral-400 space-y-0.5">
                    <div>{accuracy}% accuracy</div>
                    <div>🔥 {streak} streak</div>
                    <div className="text-neutral-500">{date}</div>
                </div>
            </div>

            {/* Hover footer */}
            <div className="absolute bottom-0 inset-x-0 h-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/40 to-transparent px-6 py-1 flex items-center justify-between text-xs">
                <span
                    className="text-blue-400 hover:text-blue-300 cursor-pointer"
                    onClick={onClick}
                >
                    View details →
                </span>
            </div>
        </div>
    );
};

export const MultiplayerUserHistory: React.FC = () => {
    // Replace these placeholders with your actual store and types if needed
    const componentRef = useRef<HTMLDivElement>(null);
    const [minimize, setMinimize] = useState(true);
    const { resultsByRoom, roomOrder } = useMultiplayerRStore();
    useEffect(() => {
        if (minimize) return;

        const handleOutsideClick = (event: PointerEvent) => {
            if (
                componentRef.current &&
                !componentRef.current.contains(event.target as Node)
            ) {
                setMinimize(true);
            }
        };

        document.addEventListener("pointerdown", handleOutsideClick);

        return () => {
            document.removeEventListener("pointerdown", handleOutsideClick);
        };
    }, [minimize]);

    const history = useMemo<MatchHistoryEntry[]>(() => {
        return roomOrder
            .map((roomId) => {
                const result = resultsByRoom[roomId];
                if (!result || !result.currentUser || result.userRank == null)
                    return null;

                return {
                    roomId,
                    date: new Date(result.fetchedAt).toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        }
                    ),
                    isWin: result.userRank === 1,
                    userRank: result.userRank,
                    totalPlayers: result.players.length,
                    score: result.currentUser.score,
                    accuracy: result.currentUser.accuracy,
                    streak: result.currentUser.streak,
                };
            })
            .reverse()
            .filter(Boolean) as MatchHistoryEntry[];
    }, [roomOrder, resultsByRoom]);

    // --- Minimized State ---
    if (minimize === true) {
        return (
            <motion.button // Using motion.button for smooth tap/initial animation
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={
                    "bg-neutral-900 p-6 rounded-full text-center text-neutral-500 " +
                    "hover:bg-neutral-800 transition-colors duration-200 shadow-lg " + // Added transition for better feel
                    "flex items-center justify-center"
                }
                onClick={() => setMinimize(false)}
            >
                {/* Icon will fade in/out with the button */}
                <History className="w-6 h-6" />
            </motion.button>
        );
    }

    // --- Empty State (Maximized but no history) ---
    if (history.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl bg-neutral-900 p-6 text-center text-neutral-500"
            >
                No recent multiplayer matches found.
                {/* Add a close/minimize button for this state as well */}
                <button
                    className="mt-4 block mx-auto text-sm text-blue-400 hover:text-blue-300"
                    onClick={() => setMinimize(true)}
                >
                    <ChevronDown className="w-5 h-5 mx-auto transition-transform duration-200" />
                </button>
            </motion.div>
        );
    }

    // --- Maximized State (With History) ---
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }} // Initial state for animation
            animate={{ opacity: 1, y: 0, scale: 1 }} // Final state
            ref={componentRef}
            transition={{
                duration: 0.3,
                type: "spring",
                damping: 30,
                stiffness: 500,
            }} // Smooth, spring-like transition
            className="rounded-2xl relative bg-neutral-950 w-100 p-6 shadow-2xl border border-neutral-800"
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                    <History className="w-6 h-6" />{" "}
                    <span className="ml-2">Recent Games</span>
                </h3>

                {/* Minimize Button */}
                <button
                    className="text-neutral-500 hover:text-blue-400 transition-colors duration-200 p-1 rounded-full hover:bg-neutral-900"
                    onClick={() => setMinimize(true)}
                >
                    {/* Animated icon: rotates as it minimizes */}
                    <ChevronDown className="w-6 h-6 transition-transform duration-300 ease-in-out" />
                </button>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {history.map((match) => (
                    // Using a motion wrapper around the card for a subtle entrance animation
                    <motion.div
                        key={match.roomId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 0.2,
                            delay: 0.05 * history.indexOf(match),
                        }} // Staggered delay for list items
                    >
                        <MatchHistoryCard match={match} />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default MultiplayerUserHistory;
