"use client";

import React, { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { SendHorizonal } from "lucide-react";
import Cookies from "js-cookie";

type Message = {
  userId: string;
  username: string;
  content: string;
};

type ChatProps = {
  stompClient: Client | null;
};

const ChatComponent: React.FC<ChatProps> = ({ stompClient }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const roomId =
    typeof window !== "undefined" ? localStorage.getItem("roomId") : null;
  const userCookieRaw = Cookies.get("user");
  let user = { id: "unknown", name: "Anonymous" };

  try {
    if (userCookieRaw) {
      const decoded = decodeURIComponent(userCookieRaw);
      user = JSON.parse(decoded);
    }
  } catch (err) {
    console.error("Failed to decode or parse user cookie:", err);
  }

  const userId = user.id;
  const username = user.name;

  useEffect(() => {
    if (!stompClient || !stompClient.connected || !roomId) return;

    const subscription = stompClient.subscribe(
      `/topic/room/${roomId}/chat`,
      (message) => {
        try {
          const msg = JSON.parse(message.body) as Message;
          setMessages((prev) => [...prev, msg]);
          console.log("Received:", msg);
        } catch (err) {
          console.error("Failed to parse message:", err);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [stompClient, roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !stompClient || !stompClient.connected || !roomId)
      return;

    const msg: Message = {
      userId,
      username,
      content: input.trim(),
    };

    stompClient.publish({
      destination: `/app/chat/${roomId}`,
      body: JSON.stringify(msg),
    });

    console.log("Sent:", msg);
    setInput("");
  };

  return (
    <div className="max-w-lg mx-auto bg-[#1e1e1e] h-120 p-4 rounded-3xl shadow-lg font-[Aclonica]">
      <div
        className="bg-[#1a1a1a] p-4 h-100 overflow-y-auto rounded-t-3xl border border-gray-700 mb-2 space-y-2"
        style={{
          boxShadow:
            "0 0 10px 2px rgba(255, 255, 255, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.2)",
          backgroundColor: "#1c1c1c",
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`text-sm w-auto p-2 rounded-2xl ${
              msg.userId == userId
                ? "bg-blue-600 text-white text-right ml-auto max-w-[50%] "
                : "bg-gray-700 text-white text-left mr-auto max-w-[80%]"
            }`}
          >
            <strong className="block text-xs text-gray-300">
              {msg.username}
            </strong>
            {msg.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 p-2 rounded-bl-2xl bg-[#2e2e2e] text-white focus:outline-none"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-[#ee4035] px-4 rounded-br-2xl text-white hover:bg-red-600"
        >
          <SendHorizonal />
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
