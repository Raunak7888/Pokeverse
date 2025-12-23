"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Copy, Check, Crown, Users, Target } from "lucide-react";
import { toast } from "sonner";
import Chat from "@/components/quiz/multiPlayerQuestion/Chat";
import { useMultiplayerRoomStore } from "@/store/useMultiplayerRoomStore";
import { MultiplayerPlayersInRoomDto } from "@/components/utils/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/components/utils/websocketprovider";
import Image from "next/image";

export default function Lobby() {
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    const userId = useAuthStore().user?.id;
    const room = useMultiplayerRoomStore((state) => state.room);

    const [roomCode, setRoomCode] = useState<string>("000000");
    const [players, setPlayers] = useState<MultiplayerPlayersInRoomDto[]>([]);
    const [maxPlayers, setMaxPlayers] = useState<number>(2);
    const [rounds, setRounds] = useState<number>(5);

    const { subscribe, send, connected } = useWebSocket();

    // Initialize state from room data
    useEffect(() => {
        if (room) {
            setRoomCode(String(room.code || "000000"));
            setPlayers(room.players || []);
            setMaxPlayers(room.maxPlayers || 2);
            setRounds(room.rounds || 5);
            console.log("📦 Room data loaded:", room);
        }
    }, [room]);

    useEffect(() => {
        if (!room || !connected) return;

        const roomUpdates = `/topic/room/${room.id}/quiz`;
        const gameInfo = `/topic/room/${room.id}/game/info`;
        const errorTopic = `/topic/player/${userId}/error`;

        console.log("🔔 Subscribing to lobby topics");

        // --- 1) Room Updates (players in room) ---
        const unsubRoom = subscribe(roomUpdates, (message) => {
            try {
                const updatedRoom = JSON.parse(message.body);
                setPlayers(updatedRoom.players || []);
                useMultiplayerRoomStore.getState().setRoom(updatedRoom);
            } catch (err) {
                console.error("❌ Failed to parse room update:", err);
            }
        });

        // --- 2) Game Start Info ---
        const unsubInfo = subscribe(gameInfo, (message) => {
            try {
                const data = JSON.parse(message.body);
                console.log("ℹ Game Info:", data);

                if (
                    data.message === "Game is starting soon!" ||
                    data.message === "Game started! Get ready!"
                ) {
                    router.push("/quiz/multiplayer/quiz");
                }
            } catch (err) {
                console.error("❌ Failed to parse game info:", err);
            }
        });

        // --- 3) Errors ---
        const unsubError = subscribe(errorTopic, (message) => {
            try {
                const err = JSON.parse(message.body);
                toast.error(err.message || "Unknown error");
            } catch {
                toast.error("Unexpected error");
            }
        });

        return () => {
            unsubRoom();
            unsubInfo();
            unsubError();
        };
    }, [room, connected, subscribe, router, userId]);

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        toast.success("Room code copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleStart = () => {
        if (players.length < 2) {
            toast.error("Need at least 2 players to start");
            return;
        }

        const success = send(`/app/game/start/${room?.id}/${userId}`, {});

        if (!success) {
            toast.error("Failed to start game. Please try again.");
        }
    };

    const isCurrentUserHost = room?.hostId === userId;

    if (!room) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4 p-8">
                    <Users className="w-16 h-16 text-foreground/30 mx-auto animate-pulse" />
                    <h2 className="text-2xl font-bold text-foreground">
                        Loading Room...
                    </h2>
                    <p className="text-foreground/60">
                        If this persists, please try rejoining the room
                    </p>
                    <Button
                        onClick={() => router.push("/multiplayer")}
                        className="mt-4"
                    >
                        Back to Multiplayer
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div
                className="w-screen bg-background md:scale-75 md:mt-0 flex justify-center items-center p-4 mt-15"
                style={{ height: "92vh" }}
            >
                <div className="w-full h-full max-w-7xl">
                    {/* Mobile/Tablet Layout */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="lg:hidden bg-card rounded-3xl border-2 border-border w-full h-full p-6 space-y-4 shadow-lg overflow-y-auto"
                    >
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-center space-y-2"
                        >
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
                                <Users className="w-7 h-7 text-primary" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
                                Game Lobby
                            </h1>
                            <p className="text-sm text-foreground/60 flex items-center justify-center gap-2">
                                <span
                                    className={`w-2 h-2 rounded-full ${
                                        connected
                                            ? "bg-green-500 animate-pulse"
                                            : "bg-red-500"
                                    }`}
                                />
                                {connected ? "Connected" : "Connecting..."}
                            </p>
                        </motion.div>

                        {/* Room Code */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-background rounded-2xl border-2 border-foreground/20 p-4 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground/60">
                                    Room Code
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={copyRoomCode}
                                    className="hover:bg-primary/10 transition h-8"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4 text-foreground" />
                                    )}
                                </Button>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                {roomCode.split("").map((digit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: 0.3 + index * 0.05,
                                        }}
                                        className="w-10 h-12 flex items-center justify-center bg-foreground/5 border-2 border-foreground/20 rounded-lg text-xl font-bold text-foreground"
                                    >
                                        {digit}
                                    </motion.div>
                                ))}
                            </div>
                            <p className="text-xs text-center text-foreground/50">
                                Share this code with your friends
                            </p>
                        </motion.div>

                        {/* Game Settings */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="grid grid-cols-2 gap-3"
                        >
                            <div className="bg-background rounded-xl border-2 border-foreground/20 p-3 space-y-2">
                                <div className="flex items-center gap-2 text-foreground/60">
                                    <Target className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-medium">
                                        Rounds
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-foreground">
                                    {rounds}
                                </p>
                            </div>
                            <div className="bg-background rounded-xl border-2 border-foreground/20 p-3 space-y-2">
                                <div className="flex items-center gap-2 text-foreground/60">
                                    <Users className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-medium">
                                        Players
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-foreground">
                                    {players.length}/{maxPlayers}
                                </p>
                            </div>
                        </motion.div>

                        {/* Players List */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-3"
                        >
                            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Players in Lobby
                            </h3>
                            <div className="space-y-2">
                                {players.map((player, index) => {
                                    const isPlayerHost =
                                        player.userId === room.hostId;
                                    return (
                                        <motion.div
                                            key={player.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: 0.6 + index * 0.1,
                                            }}
                                            className="bg-background rounded-xl border-2 border-foreground/20 p-3 flex items-center justify-between hover:border-primary/40 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-9 h-9 ring-2 ring-primary/50">
                                                    {player?.avatar ? (
                                                        <Image
                                                            src={player.avatar}
                                                            alt="User avatar"
                                                            width={60}
                                                            height={60}
                                                            className="object-fill w-9 h-9"
                                                        />
                                                    ) : (
                                                        <AvatarFallback className="bg-primary text-foreground text-sm font-aclonica">
                                                            {player?.name[0]}
                                                        </AvatarFallback>
                                                    )}
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-foreground text-sm flex items-center gap-2">
                                                        {player.name.toUpperCase()}
                                                        {isPlayerHost && (
                                                            <Crown className="h-3 w-3 text-yellow-500" />
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-foreground/50">
                                                        {isPlayerHost
                                                            ? "Host"
                                                            : "Player"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        </motion.div>
                                    );
                                })}
                                {Array.from({
                                    length: maxPlayers - players.length,
                                }).map((_, index) => (
                                    <motion.div
                                        key={`empty-${index}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay:
                                                0.6 +
                                                (players.length + index) * 0.1,
                                        }}
                                        className="bg-background/50 rounded-xl border-2 border-dashed border-foreground/20 p-3 flex items-center gap-3"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-foreground/5 flex items-center justify-center">
                                            <Users className="h-4 w-4 text-foreground/30" />
                                        </div>
                                        <p className="text-foreground/40 text-sm">
                                            Waiting for player...
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Start Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            {isCurrentUserHost ? (
                                <Button
                                    onClick={handleStart}
                                    disabled={players.length < 2 || !connected}
                                    className="w-full h-11 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {!connected
                                        ? "Connecting..."
                                        : players.length < 2
                                        ? "Waiting for more players..."
                                        : "Start Game"}
                                </Button>
                            ) : (
                                <div className="bg-foreground/5 rounded-xl p-4 text-center">
                                    <p className="text-foreground/60 text-sm">
                                        Waiting for host to start the game...
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Desktop Layout - Similar structure, omitted for brevity */}
                    {/* ... Copy the same pattern for desktop layout ... */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="hidden lg:grid lg:grid-cols-2 gap-6 h-full"
                    >
                        {/* Left Side - Room Details */}
                        <div className="bg-card rounded-3xl border-2 border-border p-8 shadow-lg flex flex-col">
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-center space-y-3 mb-8"
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-3">
                                    <Users className="w-10 h-10 text-primary" />
                                </div>
                                <h1 className="text-4xl font-extrabold text-foreground">
                                    Game Lobby
                                </h1>
                                <p className="text-foreground/60">
                                    Waiting for players to join...
                                </p>
                            </motion.div>

                            {/* Room Code */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-background rounded-2xl border-2 border-foreground/20 p-6 space-y-4 mb-6"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-foreground/60">
                                        Room Code
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={copyRoomCode}
                                        className="hover:bg-primary/10 transition h-8"
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4 text-foreground" />
                                        )}
                                    </Button>
                                </div>
                                <div className="flex items-center justify-center gap-3">
                                    {roomCode.split("").map((digit, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: 0.3 + index * 0.05,
                                            }}
                                            className="w-16 h-20 flex items-center justify-center bg-foreground/5 border-2 border-foreground/20 rounded-lg text-3xl font-bold text-foreground"
                                        >
                                            {digit}
                                        </motion.div>
                                    ))}
                                </div>
                                <p className="text-xs text-center text-foreground/50">
                                    Share this code with your friends
                                </p>
                            </motion.div>

                            {/* Game Settings */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="grid grid-cols-2 gap-4 mb-8"
                            >
                                <div className="bg-background rounded-xl border-2 border-foreground/20 p-5 space-y-3">
                                    <div className="flex items-center gap-2 text-foreground/60">
                                        <Target className="h-5 w-5 text-primary" />
                                        <span className="text-sm font-medium">
                                            Rounds
                                        </span>
                                    </div>
                                    <p className="text-4xl font-bold text-foreground">
                                        {rounds}
                                    </p>
                                </div>
                                <div className="bg-background rounded-xl border-2 border-foreground/20 p-5 space-y-3">
                                    <div className="flex items-center gap-2 text-foreground/60">
                                        <Users className="h-5 w-5 text-primary" />
                                        <span className="text-sm font-medium">
                                            Players
                                        </span>
                                    </div>
                                    <p className="text-4xl font-bold text-foreground">
                                        {players.length}/{maxPlayers}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Start Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="mt-auto"
                            >
                                {isCurrentUserHost ? (
                                    <Button
                                        onClick={handleStart}
                                        disabled={players.length < 2}
                                        className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {players.length < 2
                                            ? "Waiting for more players..."
                                            : "Start Game"}
                                    </Button>
                                ) : (
                                    <div className="bg-foreground/5 rounded-xl p-5 text-center">
                                        <p className="text-foreground/60">
                                            Waiting for host to start the
                                            game...
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                        {/* Right Side - Players List */}
                        <div className="bg-card rounded-3xl border-2 border-border p-8 shadow-lg flex flex-col">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-col h-full"
                            >
                                <h3 className="text-2xl font-semibold text-foreground flex items-center gap-3 mb-6">
                                    <Users className="h-6 w-6 text-primary" />
                                    Players in Lobby
                                </h3>
                                <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                                    {players.map((player, index) => {
                                        const isPlayerHost =
                                            player.userId === room.hostId;
                                        return (
                                            <motion.div
                                                key={player.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: 0.6 + index * 0.1,
                                                }}
                                                className="bg-background rounded-xl border-2 border-foreground/20 p-5 flex items-center justify-between hover:border-primary/40 transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="w-16 h-16 ring-4 ring-primary/50">
                                                        {player?.avatar ? (
                                                            <Image
                                                                src={
                                                                    player.avatar
                                                                }
                                                                alt="User avatar"
                                                                width={100}
                                                                height={100}
                                                                className="rounded-full object-fill "
                                                            />
                                                        ) : (
                                                            <AvatarFallback className="bg-primary text-foreground text-2xl font-aclonica">
                                                                {
                                                                    player
                                                                        ?.name[0]
                                                                }
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-foreground text-lg flex items-center gap-2">
                                                            {player.name}
                                                            {isPlayerHost && (
                                                                <Crown className="h-5 w-5 text-yellow-500" />
                                                            )}
                                                        </p>
                                                        <p className="text-sm text-foreground/50">
                                                            {isPlayerHost
                                                                ? "Host"
                                                                : "Player"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                            </motion.div>
                                        );
                                    })}
                                    {Array.from({
                                        length: maxPlayers - players.length,
                                    }).map((_, index) => (
                                        <motion.div
                                            key={`empty-${index}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay:
                                                    0.6 +
                                                    (players.length + index) *
                                                        0.1,
                                            }}
                                            className="bg-background/50 rounded-xl border-2 border-dashed border-foreground/20 p-5 flex items-center gap-4"
                                        >
                                            <div className="w-14 h-14 rounded-full bg-foreground/5 flex items-center justify-center">
                                                <Users className="h-6 w-6 text-foreground/30" />
                                            </div>
                                            <p className="text-foreground/40">
                                                Waiting for player...
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
            <Chat />
        </>
    );
}
