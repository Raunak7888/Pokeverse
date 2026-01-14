"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Minus,
    Plus,
    Dice2,
    Users,
    Target,
    Sparkles,
    House,
    ChevronLeft
} from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useMultiplayerRoomStore } from "@/store/useMultiplayerRoomStore";
import axios from "axios";
import { customToast } from "@/lib/toast";
import { useChatStore } from "@/store/useMessageStore";
import { useRouter } from "next/navigation";
import TopicComponent from "@/components/quiz/TopicComponent";

export default function Create() {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [roomName, setRoomName] = useState("");
    const [rounds, setRounds] = useState(5);
    const [players, setPlayers] = useState(2);
    const [isCreating, setIsCreating] = useState(false);

    const user = useAuthStore().getUser();
    const hostId = user?.id;
    const { setRoom, clearRoom } = useMultiplayerRoomStore();
    const router = useRouter();

    const getRoomNameError = (name: string) => {
        if (!name) return null;
        if (name.length <= 6) return "Name must be at least 7 characters";
        if (!/^[a-zA-Z0-9 ]+$/.test(name)) return "Alphanumeric only";
        if (/^\d+$/.test(name)) return "Cannot be all numbers";
        return null;
    };

    const isNameInvalid =
        getRoomNameError(roomName) !== null || !roomName.trim();

    const handleCreate = async () => {
        if (isNameInvalid || !selectedTopic) return;
        if (!hostId) return customToast.error("You must be logged in.");

        try {
            setIsCreating(true);
            const roomCreationDto = {
                name: roomName,
                rounds,
                hostId,
                maxPlayers: players,
                topic: selectedTopic,
            };

            const res = await api.post(
                "/v1/api/quiz/multiplayer/room/create",
                roomCreationDto
            );

            clearRoom();
            setRoom(res.data);
            useChatStore.getState().clearMessages();

            customToast.success("Room created successfully!");
            router.push("/quiz/multiplayer/lobby");
        } catch (error: unknown) {
            console.error("Failed to create room:", error);
            if (axios.isAxiosError(error)) {
                customToast.error(
                    error.response?.data?.message || "Server error occurred."
                );
            } else {
                customToast.error("An unexpected error occurred.");
            }
        } finally {
            setIsCreating(false);
        }
    };

    const generateRandomRoomName = () => {
        const adjectives = [
            "Swift",
            "Brave",
            "Wild",
            "Epic",
            "Thunder",
            "Crystal",
        ];
        const nouns = [
            "Pikachu",
            "Eevee",
            "Dragonite",
            "Gengar",
            "Snorlax",
            "Charizard",
        ];
        const randomName = `${
            adjectives[Math.floor(Math.random() * adjectives.length)]
        } ${nouns[Math.floor(Math.random() * nouns.length)]}`;
        setRoomName(randomName);
    };

    return (
        <div className="min-h-screen relative flex justify-center items-center p-4 bg-background overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.1),transparent_50%)]"
                />
            </div>

            <AnimatePresence mode="wait">
                {!selectedTopic ? (
                    <TopicComponent
                        onSelect={setSelectedTopic}
                    />
                ) : (
                    /* STEP 2: ROOM CONFIGURATION */
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative mt-15 bg-background/80 backdrop-blur-2xl rounded-[2.5rem] border border-foreground/10 w-full max-w-md p-6 sm:p-10 space-y-8 shadow-2xl shadow-primary/10"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTopic(null)}
                            className="absolute top-6 left-6 text-muted-foreground hover:text-primary"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back
                        </Button>

                        <div className="text-center space-y-1 pt-4">
                            <h2 className="text-2xl text-foreground font-bold">Room Setup</h2>
                            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                                Topic:{" "}
                                <span className="text-primary font-bold uppercase tracking-tighter">
                                    {selectedTopic}
                                </span>
                            </p>
                        </div>

                        {/* Room Name Input */}
                        <div className="space-y-3">
                            <Label
                                htmlFor="roomName"
                                className="text-sm font-semibold flex text-foreground items-center gap-2"
                            >
                                <House className="h-4 w-4 text-primary" /> Room
                                Name
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="roomName"
                                    placeholder="Enter room name..."
                                    value={roomName}
                                    onChange={(e) =>
                                        setRoomName(e.target.value)
                                    }
                                    className="rounded-xl border-2 text-foreground bg-background focus:ring-primary/20"
                                    disabled={isCreating}
                                />
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={generateRandomRoomName}
                                    className="rounded-xl border-2 shrink-0 group"
                                    disabled={isCreating}
                                >
                                    <Dice2 className="h-5 w-5 text-foreground group-hover:rotate-90 transition-transform duration-500" />
                                </Button>
                            </div>
                            <AnimatePresence>
                                {roomName && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-[10px] flex items-center justify-between px-1"
                                    >
                                        <span
                                            className={
                                                isNameInvalid
                                                    ? "text-red-500"
                                                    : "text-green-500"
                                            }
                                        >
                                            {getRoomNameError(roomName) ||
                                                "Name is valid"}
                                        </span>
                                        <span>{roomName.length}/30</span>
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Config Sliders/Counters */}
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold flex text-foreground items-center gap-2">
                                    <Target className="h-4 w-4 text-primary" />{" "}
                                    Rounds
                                </Label>
                                <div className="flex items-center justify-between bg-background p-2 rounded-2xl border">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="rounded-full"
                                        onClick={() =>
                                            setRounds((r) => Math.max(5, r - 5))
                                        }
                                        disabled={rounds <= 5}
                                    >
                                        <Minus className="h-4 w-4 text-foreground" />
                                    </Button>
                                    <span className="text-2xl font-black text-primary">
                                        {rounds}
                                    </span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="rounded-full"
                                        onClick={() =>
                                            setRounds((r) =>
                                                Math.min(20, r + 5)
                                            )
                                        }
                                        disabled={rounds >= 20}
                                    >
                                        <Plus className="h-4 w-4 text-foreground" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm text-foreground font-semibold flex items-center gap-2">
                                    <Users className="h-4 w-4 text-primary" />{" "}
                                    Max Players
                                </Label>
                                <div className="flex items-center justify-between bg-background p-2 rounded-2xl border">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="rounded-xl"
                                        onClick={() =>
                                            setPlayers((p) =>
                                                Math.max(2, p - 1)
                                            )
                                        }
                                        disabled={players <= 2}
                                    >
                                        <Minus className="h-4 w-4 text-foreground" />
                                    </Button>
                                    <span className="text-2xl font-black text-primary">
                                        {players}
                                    </span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="rounded-xl"
                                        onClick={() =>
                                            setPlayers((p) =>
                                                Math.min(6, p + 1)
                                            )
                                        }
                                        disabled={players >= 6}
                                    >
                                        <Plus className="h-4 w-4 text-foreground" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleCreate}
                            disabled={isNameInvalid || isCreating}
                            className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl transition-all active:scale-95"
                        >
                            {isCreating ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1,
                                    }}
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                />
                            ) : (
                                <span className="flex items-center gap-2">
                                    Create Room <Sparkles className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
