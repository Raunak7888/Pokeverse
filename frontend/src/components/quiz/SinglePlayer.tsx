"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useSinglePlayerQuestionsStore } from "@/store/useSinglePlayerQuestionsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useSinglePlayerSessionStore } from "@/store/useSinglePlayerSessionStore";
import { customToast } from "@/lib/toast";
import { BACKEND_URL } from "../utils/backendUrl";

export default function SinglePlayer() {
  const regions = ["All", "Kanto", "Johto", "Hoenn", "Sinnoh"];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const [region, setRegion] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [rounds, setRounds] = useState(5);
  const [loading, setLoading] = useState(false);

  const { setQuestions } = useSinglePlayerQuestionsStore();
  const { setSession } = useSinglePlayerSessionStore();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const handleStart = async () => {
    if (!user?.id) {
      customToast.error("You must be logged in to start a quiz.");
      return;
    }

    setLoading(true);

    const regionValue = region === "all" ? "" : region;
    const difficultyValue = difficulty === "all" ? "" : difficulty;

    try {
      const response = await fetch(
        `${BACKEND_URL}/v1/api/quiz/single-player/session/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            rounds,
            region: regionValue.toUpperCase(),
            difficulty: difficultyValue.toUpperCase(),
          }),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const err = await response.json();
          throw new Error(
            err.message || "Failed to start session (Server error)"
          );
        } else {
          throw new Error(
            `Server responded with status ${response.status}: ${response.statusText}`
          );
        }
      }

      const data = await response.json();
      console.log("Received data:", data);
      if (!data?.questions) {
        customToast.error("No questions received from server.");
        return;
      }
      console.log("Storing questions:", data.questions);

      setQuestions(data.questions); // ✅ only save questions
      console.log("Setting session:", data.session);
      setSession(data.session); // ✅ save entire session object
      customToast.success("Quiz session started!");
      router.push(`/quiz/singleplayer/question`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        customToast.error(err.message);
      } else {
        customToast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const cycleValue = (arr: string[], current: string, dir: "prev" | "next") => {
    if (!current) return arr[0].toLowerCase();
    const index = arr.findIndex(
      (v) => v.toLowerCase() === current.toLowerCase()
    );
    if (index === -1) return arr[0].toLowerCase();
    if (dir === "next") return arr[(index + 1) % arr.length].toLowerCase();
    if (dir === "prev")
      return arr[(index - 1 + arr.length) % arr.length].toLowerCase();
    return current;
  };

  return (
    <div className="space-y-6">
      {/* Region selector */}
      <div className="space-y-2">
        <Label className="text-primary">Region</Label>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setRegion(cycleValue(regions, region, "prev"))}
            className="bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="bg-muted rounded-xl px-4 w-full justify-between">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((r) => (
                <SelectItem key={r} value={r.toLowerCase()}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setRegion(cycleValue(regions, region, "next"))}
            className="bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRegion("all")}
            className="rounded-xl"
          >
            All
          </Button>
        </div>
      </div>

      {/* Difficulty selector */}
      <div className="space-y-2">
        <Label className="text-primary">Difficulty</Label>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              setDifficulty(cycleValue(difficulties, difficulty, "prev"))
            }
            className="bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="bg-muted rounded-xl px-4 w-full justify-between">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((d) => (
                <SelectItem key={d} value={d.toLowerCase()}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              setDifficulty(cycleValue(difficulties, difficulty, "next"))
            }
            className="bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDifficulty("all")}
            className="rounded-xl"
          >
            All
          </Button>
        </div>
      </div>

      {/* Rounds */}
      <div className="space-y-2">
        <Label className="text-primary">Rounds</Label>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setRounds((r) => Math.max(5, r - 5))}
            disabled={rounds <= 5}
            className="bg-muted"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-full text-center font-medium">{rounds}</span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setRounds((r) => Math.min(20, r + 5))}
            disabled={rounds >= 20}
            className="bg-muted"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRounds(20)}
            className="rounded-xl"
          >
            All
          </Button>
        </div>
      </div>

      {/* Start Button */}
      <Button
        onClick={handleStart}
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/50 text-foreground rounded-xl"
      >
        {loading ? "Starting..." : "Start Quiz"}
      </Button>
    </div>
  );
}
