"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    MessageCircle,
    X,
    Send,
    Smile,
    Clock,
    Check,
    Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useWebSocket } from "@/components/utils/websocketprovider";
import { useMultiplayerRoomStore } from "@/store/useMultiplayerRoomStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore, ChatMessage } from "@/store/useMessageStore";
import Image from "next/image";

// Backend message format
interface MessageDto {
    userId: number;
    msg: string;
    tempId: number;
}

// Backend chat message response
interface ChatMessageResponse {
    id?: number;
    userId: number;
    roomId: number;
    msg: string;
    tempId?: number;
    timestamp?: string;
    userName?: string;
}

export default function Chat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messageInput, setMessageInput] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isOpenRef = useRef(isOpen);

    // Zustand stores
    const { messages, addMessage, updateMessageStatus, clearMessages } =
        useChatStore();
    const { subscribe, send, connected } = useWebSocket();
    const room = useMultiplayerRoomStore((state) => state.room);
    const currentUser = useAuthStore((state) => state.user);

    useEffect(() => {
        isOpenRef.current = isOpen;
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [isOpen]);

    // Clear messages when leaving room
    useEffect(() => {
        return () => {
            if (!room) {
                clearMessages();
            }
        };
    }, [room, clearMessages]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom, isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            const focusTimeout = setTimeout(
                () => inputRef.current?.focus(),
                300
            );
            return () => clearTimeout(focusTimeout);
        }
    }, [isOpen]);

    // Subscribe to chat messages
    useEffect(() => {
        if (!room || !connected) return;

        const chatTopic = `/topic/room/${room.id}/chat`;

        const unsubscribe = subscribe(chatTopic, (msg) => {
            try {
                const chatMessage: MessageDto | ChatMessageResponse =
                    JSON.parse(msg.body);

                if (
                    chatMessage.tempId &&
                    chatMessage.userId === currentUser?.id
                ) {
                    updateMessageStatus(
                        chatMessage.tempId,
                        "sent",
                        (chatMessage as ChatMessageResponse).id ||
                            chatMessage.tempId
                    );
                    return;
                }

                const sender = room.players.find(
                    (p) => p.userId === chatMessage.userId
                );

                if (
                    !isOpenRef.current &&
                    chatMessage.userId !== currentUser?.id
                ) {
                    setUnreadCount((prev) => prev + 1);
                }

                addMessage({
                    id: (chatMessage as ChatMessageResponse).id || Date.now(),
                    userId: chatMessage.userId,
                    user:
                        sender?.name ||
                        (chatMessage as ChatMessageResponse).userName ||
                        "Unknown",
                    text:
                        (chatMessage as ChatMessageResponse).msg ||
                        chatMessage.msg,
                    timestamp: new Date(
                        (chatMessage as ChatMessageResponse).timestamp ||
                            Date.now()
                    ),
                    isSystem: false,
                    status: "sent",
                    tempId: chatMessage.tempId,
                });
            } catch (err) {
                console.error("❌ Failed to parse chat message:", err);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [
        room,
        connected,
        subscribe,
        currentUser?.id,
        addMessage,
        updateMessageStatus,
    ]);

    // Subscribe to error messages
    useEffect(() => {
        if (!currentUser?.id || !connected) return;
        const errorTopic = `/topic/player/${currentUser.id}/error`;

        const unsubscribe = subscribe(errorTopic, (msg) => {
            try {
                const error = JSON.parse(msg.body);
                toast.error(error.message || "An error occurred");
            } catch (err) {
                console.error("❌ Failed to parse error message:", err);
            }
        });

        return () => unsubscribe();
    }, [currentUser?.id, connected, subscribe]);

    const handleSend = () => {
        const messageText = messageInput.trim();
        if (!messageText) return;
        if (!room || !connected || !currentUser?.id) {
            toast.error("Connection issue");
            return;
        }

        const tempId = Math.floor(Date.now() / 1000);

        const messagePayload: MessageDto = {
            userId: currentUser.id,
            msg: messageText,
            tempId: tempId,
        };

        addMessage({
            id: tempId,
            userId: currentUser.id,
            user: currentUser.name || "You",
            text: messageText,
            timestamp: new Date(),
            isSystem: false,
            status: "sending",
            tempId: tempId,
        });

        const success = send(`/app/chat/${room.id}`, messagePayload);

        if (success) {
            setMessageInput("");
        } else {
            updateMessageStatus(tempId, "failed");
            toast.error("Failed to send");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (date: Date | string) => {
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const isCurrentUserMessage = (msg: ChatMessage) =>
        msg.userId === currentUser?.id;

    const getUserAvatar = (userId: number) => {
        const player = room?.players.find((p) => p.userId === userId);
        return player?.avatar;
    };

    const getUserName = (userId: number, fallbackName: string) => {
        const player = room?.players.find((p) => p.userId === userId);
        return player?.name || fallbackName;
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.5,
                }}
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all relative"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{
                                    rotate: -90,
                                    scale: 0.5,
                                    opacity: 0,
                                }}
                                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <X className="h-6 w-6" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="open"
                                initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
                                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <MessageCircle className="h-6 w-6" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {!isOpen && unreadCount > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center font-bold px-1 border-2 border-background"
                            >
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 20,
                            scale: 0.95,
                            transformOrigin: "bottom right",
                        }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                        }}
                        // INCREASED SIZE: w-[400px] and h-[600px] (previously smaller)
                        className="fixed bottom-24 right-6 z-40 w-full max-w-[400px]"
                    >
                        <div className="bg-card rounded-2xl border-2 border-border shadow-2xl overflow-hidden flex flex-col h-[500px]">
                            {/* Header */}
                            <div className="bg-primary/5 border-b-2 border-border p-4 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center relative">
                                        <MessageCircle className="h-5 w-5 text-primary" />
                                        {connected && (
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full animate-pulse" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">
                                            {room?.name || "Game"} Chat
                                        </h3>
                                        <p className="text-xs text-foreground/50">
                                            {connected
                                                ? "Live"
                                                : "Connecting..."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div
                                className="
                                            flex-1 overflow-y-auto p-4 space-y-4 bg-background/50

                                            scrollbar-thin
                                            scrollbar-thumb-foreground/60
                                            scrollbar-track-foreground/10
                                            hover:scrollbar-thumb-foreground/80

                                            [&::-webkit-scrollbar]:w-1.5
                                            [&::-webkit-scrollbar-track]:rounded-full
                                            [&::-webkit-scrollbar-track]:bg-foreground/10
                                            [&::-webkit-scrollbar-thumb]:rounded-full
                                            [&::-webkit-scrollbar-thumb]:bg-foreground/60
                                            hover:[&::-webkit-scrollbar-thumb]:bg-foreground/80
                                        "
                            >
                                1. CENTERED SYSTEM/EMPTY MESSAGE
                                {messages.length === 0 && (
                                    <div className="h-[250px] flex flex-col items-center justify-center text-center opacity-70 space-y-2">
                                        <div className="p-4 rounded-full bg-primary/5 mb-2">
                                            <Sparkles className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="bg-primary/5 px-4 py-2 rounded-xl text-sm font-medium text-foreground/80">
                                            Welcome to the chat!
                                        </div>
                                        <p className="text-xs text-foreground/50">
                                            Start the conversation below.
                                        </p>
                                    </div>
                                )}
                                <AnimatePresence initial={false}>
                                    {messages.map((msg, index) => (
                                        <motion.div
                                            layout
                                            key={`${msg.id}-${
                                                msg.tempId || index
                                            }`}
                                            initial={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.95,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            transition={{ duration: 0.2 }}
                                            className={`flex gap-2 ${
                                                isCurrentUserMessage(msg)
                                                    ? "justify-end"
                                                    : "justify-start"
                                            }`}
                                        >
                                            {/* Avatar for other users */}
                                            {!isCurrentUserMessage(msg) && (
                                                <Avatar className="w-8 h-8 ring-2 ring-primary/30 flex-shrink-0 mt-auto mb-1">
                                                    {getUserAvatar(
                                                        msg.userId
                                                    ) ? (
                                                        <Image
                                                            src={
                                                                getUserAvatar(
                                                                    msg.userId
                                                                )!
                                                            }
                                                            alt={msg.user}
                                                            width={32}
                                                            height={32}
                                                            className="object-cover w-8 h-8 rounded-full"
                                                        />
                                                    ) : (
                                                        <AvatarFallback className="bg-primary/20 text-foreground text-xs">
                                                            {getUserName(
                                                                msg.userId,
                                                                msg.user
                                                            )[0]?.toUpperCase()}
                                                        </AvatarFallback>
                                                    )}
                                                </Avatar>
                                            )}

                                            <div
                                                className={`flex flex-col relative top-5  gap-1 max-w-[85%]`}
                                            >
                                                {/* User Name (only for others) */}
                                                {!isCurrentUserMessage(msg) && (
                                                    <span className="text-xs font-medium text-foreground/50 ml-1">
                                                        {getUserName(
                                                            msg.userId,
                                                            msg.user
                                                        )}
                                                    </span>
                                                )}

                                                {/* Message Bubble */}
                                                <motion.div
                                                    layout
                                                    className={`rounded-2xl px-3 py-2 shadow-sm ${
                                                        isCurrentUserMessage(
                                                            msg
                                                        )
                                                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                            : "bg-foreground/5 text-foreground border border-border rounded-tl-sm"
                                                    } ${
                                                        msg.status === "failed"
                                                            ? "bg-destructive/90 text-destructive-foreground"
                                                            : ""
                                                    }`}
                                                >
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                        {msg.text}
                                                        {/* Time & Status Inline Bottom Corner */}
                                                        <span
                                                            className={`float-right ml-3 relative top-3 text-[10px] flex items-center gap-0.5 select-none ${
                                                                isCurrentUserMessage(
                                                                    msg
                                                                )
                                                                    ? "text-primary-foreground/70"
                                                                    : "text-foreground/40"
                                                            }`}
                                                        >
                                                            {formatTime(
                                                                msg.timestamp
                                                            )}
                                                            {isCurrentUserMessage(
                                                                msg
                                                            ) && (
                                                                <>
                                                                    {msg.status ===
                                                                        "sending" && (
                                                                        <Clock className="h-2.5 w-2.5 animate-pulse ml-0.5" />
                                                                    )}
                                                                    {msg.status ===
                                                                        "sent" && (
                                                                        <Check className="h-2.5 w-2.5 ml-0.5" />
                                                                    )}
                                                                    {msg.status ===
                                                                        "failed" && (
                                                                        <X className="h-2.5 w-2.5 ml-0.5" />
                                                                    )}
                                                                </>
                                                            )}
                                                        </span>
                                                    </p>
                                                </motion.div>
                                            </div>

                                            {/* Avatar for current user */}
                                            {isCurrentUserMessage(msg) && (
                                                <Avatar className="w-8 h-8 ring-2 ring-primary/50 flex-shrink-0 mt-auto mb-1">
                                                    {getUserAvatar(
                                                        msg.userId
                                                    ) ? (
                                                        <Image
                                                            src={
                                                                getUserAvatar(
                                                                    msg.userId
                                                                )!
                                                            }
                                                            alt={msg.user}
                                                            width={32}
                                                            height={32}
                                                            className="object-cover w-8 h-8 rounded-full"
                                                        />
                                                    ) : (
                                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                            {currentUser?.name?.[0]?.toUpperCase() ||
                                                                "Y"}
                                                        </AvatarFallback>
                                                    )}
                                                </Avatar>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="border-t-2 border-border p-4 bg-card shrink-0">
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1 relative">
                                        <Input
                                            ref={inputRef}
                                            placeholder={
                                                connected
                                                    ? "Type a message..."
                                                    : "Connecting..."
                                            }
                                            value={messageInput}
                                            onChange={(e) =>
                                                setMessageInput(e.target.value)
                                            }
                                            onKeyUp={handleKeyPress}
                                            disabled={!connected}
                                            // PLACEHOLDER COLOR MODIFIED HERE
                                            className="bg-background text-foreground border-2 border-foreground/10 rounded-xl pr-10 focus-visible:ring-primary focus-visible:border-primary transition-all "
                                            maxLength={500}
                                        />
                                        <button
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-primary transition-colors disabled:opacity-50"
                                            onClick={() =>
                                                toast.info(
                                                    "Emoji picker coming soon!"
                                                )
                                            }
                                            disabled={!connected}
                                        >
                                            <Smile className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <Button
                                        onClick={handleSend}
                                        disabled={
                                            !messageInput.trim() || !connected
                                        }
                                        className="h-10 w-10 p-0 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all active:scale-95"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
