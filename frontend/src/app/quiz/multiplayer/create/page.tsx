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
    Check,
    X,
    House,
} from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useMultiplayerRoomStore } from "@/store/useMultiplayerRoomStore";
import axios from "axios";
import { customToast } from "@/lib/toast";
import { useChatStore } from "@/store/useMessageStore";
import { useRouter } from "next/navigation";

export default function Create() {
    const [roomName, setRoomName] = useState("");
    const [rounds, setRounds] = useState(5);
    const [players, setPlayers] = useState(2);
    const [isCreating, setIsCreating] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const hostId = useAuthStore().getUser()?.id;
    const { setRoom,clearRoom } = useMultiplayerRoomStore();
    const router = useRouter();
    const handleCreate = async () => {
        if (!roomName.trim()) return;

        try {
            setIsCreating(true);

            const roomCreationDto = {
                name: roomName,
                rounds,
                hostId,
                maxPlayers: players,
            };

            const res = await api.post(
                "/v1/api/quiz/multiplayer/room/create",
                roomCreationDto
            );
            clearRoom();
            setRoom(res.data);
            setShowSuccess(true);
            useChatStore.getState().clearMessages();
            
            router.push("/quiz/multiplayer/lobby");
        } catch (error: unknown) {
            console.error("Failed to create room:", error);

            if (axios.isAxiosError(error)) {
                if (error.code === "ERR_NETWORK") {
                    customToast.error(
                        "Network Error: Unable to create room. Please check your connection."
                    );
                } else if (error.response) {
                    customToast.error(
                        `Failed: ${
                            error.response.data?.message ||
                            "Server error occurred."
                        }`
                    );
                } else {
                    customToast.error(
                        "An unexpected error occurred while creating the room."
                    );
                }
            } else {
                console.log("An unknown error occurred.");
                customToast.error("An unknown error occurred.");
            }
        } finally {
            setIsCreating(false);
        }
    };
    const getRoomNameError = (name: string) => {
        if (name.length <= 6) {
            return "Name must be at least 7 characters long";
        }
        if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
            return "Name must be alphanumeric only";
        }
        if (/^\d+$/.test(name)) {
            return "Name cannot be all numbers";
        }
        return null; // ✅ valid
    };

    const generateRandomRoomName = () => {
        const adjectives = [
            "Swift",
            "Brave",
            "Clever",
            "Wild",
            "Epic",
            "Mighty",
            "Golden",
            "Shadow",
            "Thunder",
            "Crystal",
        ];
        const nouns = [
            "Pikachu",
            "Charmander",
            "Squirtle",
            "Bulbasaur",
            "Eevee",
            "Dragonite",
            "Mewtwo",
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
        <div className="w-screen h-screen relative flex justify-center items-center pt-15 md:scale-85 p-4 bg-background overflow-hidden ">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-primary/5 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-background/80 backdrop-blur-xl rounded-3xl border border-foreground/10 w-full max-w-md p-6 sm:p-8 md:p-10 space-y-6 md:space-y-8 shadow-2xl shadow-primary/5"
            >
                {/* Floating particles */}
                <motion.div
                    className="absolute -top-2 -right-2 w-16 h-16 bg-primary/20 rounded-full blur-2xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 0.6, 0.4],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                    }}
                />

                {/* Header */}
                <motion.div
                    className="text-center space-y-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    <h1 className="text-3xl sm:text-4xl md:text-3xl font-bold text-foreground tracking-tight">
                        Create Room
                    </h1>
                    <p className="text-foreground/60 text-xs ">
                        Set up your multiplayer experience
                    </p>
                </motion.div>

                {/* Room Name */}
                <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <Label
                        htmlFor="roomName"
                        className="text-foreground text-sm font-semibold flex items-center "
                    >
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <House className="h-3 w-3 text-primary" />
                        </div>
                        Room Name
                        <span className="text-primary">*</span>
                    </Label>
                    <div className="flex gap-4">
                        <motion.div
                            className="flex-1"
                            whileTap={{ scale: 0.98 }}
                        >
                            <Input
                                id="roomName"
                                placeholder="Epic Battle Arena"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                className="bg-background/50 border-2 border-foreground/10 rounded-2xl text-foreground placeholder:text-foreground/40 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all h-10 text-sm px-4"
                                maxLength={30}
                                disabled={isCreating}
                            />
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={generateRandomRoomName}
                                className="bg-background/50 hover:bg-primary/10 hover:border-primary/50 transition-all border-2 border-foreground/10 h-10 w-10 rounded-2xl group"
                                disabled={isCreating}
                            >
                                <motion.div
                                    animate={{ rotate: 0 }}
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Dice2 className="h-5 w-5 sm:h-6 sm:w-6 text-foreground group-hover:text-primary transition-colors" />
                                </motion.div>
                            </Button>
                        </motion.div>
                    </div>
                    <AnimatePresence>
                        {roomName && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-xs text-foreground/50 flex items-center justify-between"
                            >
                                <span>{roomName.length}/30 characters</span>

                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-primary flex items-center "
                                >
                                    {getRoomNameError(roomName) === null ? (
                                        <>
                                            <Check className="w-3 h-3 text-green-500" />{" "}
                                            <span className="text-green-500">
                                                {" "}
                                                Valid
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <X className="w-3 h-3 text-red-500" />{" "}
                                            {getRoomNameError(roomName)}
                                        </>
                                    )}
                                </motion.span>
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Rounds Counter */}
                <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <div className="flex items-center ">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Target className="h-3 w-3 text-primary" />
                        </div>
                        <Label className="text-foreground text-sm font-semibold">
                            Number of Rounds
                        </Label>
                    </div>
                    <motion.div
                        className="flex items-center justify-between  bg-background/50 rounded-2xl p-2 "
                        whileHover={{
                            borderColor: "hsl(var(--primary) / 0.3)",
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                    setRounds((r) => Math.max(5, r - 5))
                                }
                                disabled={rounds <= 5 || isCreating}
                                className={`transition-all rounded-full text-foreground h-10 w-10  ${
                                    rounds <= 5
                                        ? "opacity-30 cursor-not-allowed"
                                        : "hover:bg-primary/20 bg-primary/5 hover:text-primary"
                                }`}
                            >
                                <Minus className="h-5 w-5 sm:h-6 sm:w-6" />
                            </Button>
                        </motion.div>
                        <div className="text-center min-w-[100px]">
                            <motion.span
                                key={rounds}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-3xl font-bold text-primary block"
                            >
                                {rounds}
                            </motion.span>
                            <p className="text-xs  text-foreground/50 mt-1">
                                rounds
                            </p>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                    setRounds((r) => Math.min(20, r + 5))
                                }
                                disabled={rounds >= 20 || isCreating}
                                className={`transition-all rounded-full text-foreground h-10 w-10  ${
                                    rounds >= 20
                                        ? "opacity-30 cursor-not-allowed"
                                        : "hover:bg-primary/20 bg-primary/5 hover:text-primary"
                                }`}
                            >
                                <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                            </Button>
                        </motion.div>
                    </motion.div>
                    <p className="text-xs  text-center text-foreground/50">
                        Choose between 5 and 20 rounds
                    </p>
                </motion.div>

                {/* Players Counter */}
                <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                >
                    <div className="flex items-center ">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Users className="h-3 w-3  text-primary" />
                        </div>
                        <Label className="text-foreground text-sm  font-semibold">
                            Maximum Players
                        </Label>
                    </div>
                    <motion.div
                        className="flex items-center justify-between  bg-background/50 rounded-2xl p-2 "
                        whileHover={{
                            borderColor: "hsl(var(--primary) / 0.3)",
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                    setPlayers((p) => Math.max(2, p - 1))
                                }
                                disabled={players <= 2 || isCreating}
                                className={`transition-all rounded-full text-foreground h-10 w-10  ${
                                    players <= 2
                                        ? "opacity-30 cursor-not-allowed"
                                        : "hover:bg-primary/20 bg-primary/5 hover:text-primary"
                                }`}
                            >
                                <Minus className="h-5 w-5" />
                            </Button>
                        </motion.div>
                        <div className="text-center min-w-[100px]">
                            <motion.span
                                key={players}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-3xl font-bold text-primary block"
                            >
                                {players}
                            </motion.span>
                            <p className="text-xs text-foreground/50 mt-1">
                                players
                            </p>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                    setPlayers((p) => Math.min(6, p + 1))
                                }
                                disabled={players >= 6 || isCreating}
                                className={`transition-all rounded-full text-foreground h-10 w-10 sm:h-12 sm:w-12 ${
                                    players >= 6
                                        ? "opacity-30 cursor-not-allowed"
                                        : "hover:bg-primary/20 bg-primary/5 hover:text-primary"
                                }`}
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    </motion.div>
                    <p className="text-xs text-center text-foreground/50">
                        Choose between 2 and 6 players
                    </p>
                </motion.div>

                {/* Create Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="pt-2"
                >
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            onClick={handleCreate}
                            disabled={!roomName.trim() || isCreating}
                            className="w-full h-14 sm:h-16 text-base sm:text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 relative overflow-hidden gap-4 group"
                        >
                            <AnimatePresence mode="wait">
                                {isCreating ? (
                                    <motion.div
                                        key="creating"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-4 "
                                    >
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                ease: "linear",
                                            }}
                                            className="w-5 h-5 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                                        />
                                        <span>Creating Room...</span>
                                    </motion.div>
                                ) : showSuccess ? (
                                    <motion.div
                                        key="success"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="flex items-center "
                                    >
                                        <Check className="w-6 h-6" />
                                        <span>Room Created!</span>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="create"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-3"
                                    >
                                        <span>Create Room</span>
                                        <Sparkles className="w-5 h-5" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "100%" }}
                                transition={{ duration: 0.6 }}
                            />
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Info text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center text-xs text-foreground/50"
                >
                    Your room will be ready in seconds ✨
                </motion.p>
            </motion.div>
        </div>
    );
}
