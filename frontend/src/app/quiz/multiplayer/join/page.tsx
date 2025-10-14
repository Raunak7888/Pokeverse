"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { customToast } from "@/lib/toast";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useMultiplayerRoomStore } from "@/store/useMultiplayerRoomStore";

export default function Join() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const userId = useAuthStore().getUser()?.id;
  const { setRoom } = useMultiplayerRoomStore();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(0); // keep only first char
    }

    if (!/^\d*$/.test(value)) return; // allow only digits

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) {
      customToast.error("Please paste only numbers");
      return;
    }

    const newCode = [...code];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);

    const nextEmpty = newCode.findIndex((val) => !val);
    if (nextEmpty !== -1) {
      inputRefs.current[nextEmpty]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleJoin = async () => {
    const roomCode = code.join("").trim();

    if (roomCode.length !== 6 || !/^\d+$/.test(roomCode)) {
      customToast.error("Please enter a valid 6-digit numeric code");
      return;
    }

    setIsLoading(true);

    try {

      const response = await api.post(
        `/v1/api/quiz/multiplayer/room/join?code=${roomCode}&userId=${userId}`
      );

      if (response.status === 200) {
        setRoom(response.data);
        customToast.success("Successfully joined the room!");
        router.push("/quiz/multiplayer/lobby");
      } else {
        const message =
          response.data?.message ||
          "Failed to join the room. Please try again later.";
        customToast.warning(message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message) {
          customToast.error(
            error.message || "Unexpected server error occurred."
          );
        }
      } else {
        customToast.error("Unexpected error occurred while joining the room.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  return (
    <div className="w-screen h-screen flex items-center md:scale-85 justify-center bg-background">
      <div className="w-full max-w-md py-20  border-2 border-foreground/20  rounded-2xl px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Join Room</h1>
          <p className="text-foreground/60">Enter the 6-digit code to join</p>
        </div>

        <div className="space-y-8">
          <div className="flex gap-3 justify-center">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    handleJoin();
                  }
                }}
                onPaste={handlePaste}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold rounded-lg border-2 border-foreground/20 bg-background text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                disabled={isLoading}
              />
            ))}
          </div>

          <Button
            onClick={handleJoin}
            disabled={!isCodeComplete || isLoading}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>Joining...</span>
              </div>
            ) : (
              "Join Room"
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-foreground/60">
              Don{`'`}t have a code ?{" "}
              <button
                className="text-primary hover:underline font-medium"
                onClick={() => {
                  router.push("/quiz/multiplayer/create");
                }}
              >
                Create a room
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
