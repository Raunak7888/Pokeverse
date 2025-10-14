"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, X, Send, Smile, Clock, Check } from "lucide-react";
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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Zustand stores
  const { messages, addMessage, updateMessageStatus, clearMessages } =
    useChatStore();
  const { subscribe, send, connected } = useWebSocket();
  const room = useMultiplayerRoomStore((state) => state.room);
  const currentUser = useAuthStore((state) => state.user);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        id: "welcome",
        userId: 0,
        user: "System",
        text: "Welcome to the chat! Type a message below.",
        timestamp: new Date(),
        isSystem: true,
        status: "sent",
      });
    }
  }, [addMessage, messages.length]);

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
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      const focusTimeout = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(focusTimeout);
    }
  }, [isOpen]);

  // Subscribe to chat messages
  useEffect(() => {
    if (!room || !connected) return;

    const chatTopic = `/topic/room/${room.id}/chat`;
    console.log("💬 Subscribing to chat:", chatTopic);

    const unsubscribe = subscribe(chatTopic, (msg) => {
      try {
        const chatMessage: MessageDto | ChatMessageResponse = JSON.parse(
          msg.body
        );

        console.log("📨 Received chat message:", chatMessage);

        // Check if this is our own message (optimistic update confirmation)
        if (chatMessage.tempId && chatMessage.userId === currentUser?.id) {
          console.log(
            "✅ Confirming sent message with tempId:",
            chatMessage.tempId
          );
          updateMessageStatus(
            chatMessage.tempId,
            "sent",
            (chatMessage as ChatMessageResponse).id || chatMessage.tempId
          );
          return;
        }

        // Find the user in room.players
        const sender = room.players.find(
          (p) => p.userId === chatMessage.userId
        );

        // Add as a new incoming message
        addMessage({
          id: (chatMessage as ChatMessageResponse).id || Date.now(),
          userId: chatMessage.userId,
          user:
            sender?.name ||
            (chatMessage as ChatMessageResponse).userName ||
            "Unknown",
          text: (chatMessage as ChatMessageResponse).msg || chatMessage.msg,
          timestamp: new Date(
            (chatMessage as ChatMessageResponse).timestamp || Date.now()
          ),
          isSystem: false,
          status: "sent",
          tempId: chatMessage.tempId,
        });
      } catch (err) {
        console.error("❌ Failed to parse chat message:", err);
        toast.error("Failed to receive message");
      }
    });

    return () => {
      console.log("🔕 Unsubscribing from chat");
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
    console.log("⚠️ Subscribing to errors:", errorTopic);

    const unsubscribe = subscribe(errorTopic, (msg) => {
      try {
        const error = JSON.parse(msg.body);
        console.error("❌ Server error:", error);
        toast.error(error.message || "An error occurred");
      } catch (err) {
        console.error("❌ Failed to parse error message:", err);
      }
    });

    return () => {
      console.log("🔕 Unsubscribing from errors");
      unsubscribe();
    };
  }, [currentUser?.id, connected, subscribe]);

  const handleSend = () => {
    const messageText = messageInput.trim();
    if (!messageText) {
      toast.error("Please enter a message");
      return;
    }

    if (!room || !connected) {
      toast.error("Not connected to chat");
      return;
    }

    if (!currentUser?.id) {
      toast.error("User not authenticated");
      return;
    }

    // Generate tempId (epoch time in seconds)
    const tempId = Math.floor(Date.now() / 1000);

    // Prepare message payload matching backend MessageDto
    const messagePayload: MessageDto = {
      userId: currentUser.id,
      msg: messageText,
      tempId: tempId,
    };

    console.log("📤 Sending message:", messagePayload);

    // Optimistic update - add message to local store immediately
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

    // Send message via WebSocket
    const success = send(`/app/chat/${room.id}`, messagePayload);

    if (success) {
      setMessageInput("");
      console.log("✅ Message sent successfully");
    } else {
      // Update status to failed if send fails
      updateMessageStatus(tempId, "failed");
      toast.error("Failed to send message. Check connection.");
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

  // Get user avatar from room.players
  const getUserAvatar = (userId: number) => {
    const player = room?.players.find((p) => p.userId === userId);
    return player?.avatar;
  };

  // Get user name from room.players
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
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all relative"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
          {!isOpen && messages.filter((msg) => !msg.isSystem).length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
            >
              {messages.filter((msg) => !msg.isSystem).length}
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-40 w-full max-w-sm"
          >
            <div className="bg-card rounded-2xl border-2 border-border shadow-2xl overflow-hidden flex flex-col h-[500px]">
              {/* Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-primary/5 border-b-2 border-border p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {room?.name || "Room"} Chat
                    </h3>
                    <p className="text-xs text-foreground/50">
                      {messages.filter((m) => !m.isSystem).length} messages
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      connected ? "bg-green-500 animate-pulse" : "bg-red-500"
                    }`}
                  />
                  <span className="text-xs text-foreground/60">
                    {connected ? "Online" : "Offline"}
                  </span>
                </div>
              </motion.div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
                <AnimatePresence initial={false}>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={`${msg.id}-${msg.tempId || index}`}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: Math.min(index * 0.05, 0.3),
                        ease: "easeOut",
                      }}
                      className={`flex gap-2 ${
                        isCurrentUserMessage(msg)
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {/* Avatar for other users */}
                      {!msg.isSystem && !isCurrentUserMessage(msg) && (
                        <Avatar className="w-8 h-8 ring-2 ring-primary/30 flex-shrink-0">
                          {getUserAvatar(msg.userId) ? (
                            <Image
                              src={getUserAvatar(msg.userId)!}
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
                        className={`max-w-[100%] flex ${
                          msg.isSystem
                            ? " text-center flex items-center justify-center"
                            : ""
                        }`}
                      >
                        {msg.isSystem ? (
                          <div className="bg-foreground/5 text-foreground/60 text-xs ml-25 w-40 py-2 px-4 rounded-full inline-block">
                            {msg.text}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {/* User name and timestamp */}
                            <div
                              className={`flex items-center gap-2 ${
                                isCurrentUserMessage(msg)
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              {!isCurrentUserMessage(msg) && (
                                <span className="text-xs font-medium text-foreground/70">
                                  {getUserName(msg.userId, msg.user)}
                                </span>
                              )}
                              <span className="text-xs text-foreground/40">
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>

                            {/* Message bubble */}
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className={`relative rounded-2xl px-4 py-2.5 ${
                                isCurrentUserMessage(msg)
                                  ? "bg-primary text-primary-foreground rounded-br-sm"
                                  : "bg-foreground/10 text-foreground rounded-bl-sm"
                              } ${
                                msg.status === "failed"
                                  ? "bg-red-500/80 text-white"
                                  : ""
                              }`}
                            >
                              <p className="text-sm break-words pr-6">
                                {msg.text}
                              </p>

                              {/* Message Status Indicator */}
                              {isCurrentUserMessage(msg) && (
                                <span className="absolute bottom-2 right-2">
                                  {msg.status === "sending" && (
                                    <Clock className="h-3 w-3 text-primary-foreground/70 animate-pulse" />
                                  )}
                                  {msg.status === "sent" && (
                                    <Check className="h-3 w-3 text-primary-foreground/90" />
                                  )}
                                  {msg.status === "failed" && (
                                    <X className="h-3 w-3 text-white" />
                                  )}
                                </span>
                              )}
                            </motion.div>
                          </div>
                        )}
                      </div>

                      {/* Avatar for current user */}
                      {!msg.isSystem && isCurrentUserMessage(msg) && (
                        <Avatar className="w-8 h-8 ring-2 ring-primary/50 flex-shrink-0">
                          {getUserAvatar(msg.userId) ? (
                            <Image
                              src={getUserAvatar(msg.userId)!}
                              alt={msg.user}
                              width={32}
                              height={32}
                              className="object-cover w-8 h-8 rounded-full"
                            />
                          ) : (
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {currentUser?.name?.[0]?.toUpperCase() || "Y"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="border-t-2 border-border p-4 bg-card"
              >
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      placeholder={
                        connected ? "Type a message..." : "Connecting..."
                      }
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyUp={handleKeyPress}
                      disabled={!connected}
                      className="bg-background border-2 border-foreground/20 rounded-xl pr-10 text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      maxLength={500}
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/60 transition disabled:cursor-not-allowed"
                      onClick={() => toast.info("Emoji picker coming soon!")}
                      disabled={!connected}
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={!messageInput.trim() || !connected}
                    className="h-10 w-10 p-0 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {messageInput.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-foreground/40 mt-2"
                  >
                    {messageInput.length}/500
                  </motion.p>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
