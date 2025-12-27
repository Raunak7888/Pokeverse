"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BadgePlus, Users } from "lucide-react";

export default function Multiplayer() {
    const router = useRouter();

    return (
        <div className="grid grid-cols-2 gap-6 space-y-4">
            <Button
                onClick={() => router.push("/quiz/multiplayer/create")}
                className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/50 text-foregound"
            >
                <BadgePlus className="h-5 w-5" />
                <span>Create</span>
            </Button>
            <Button
                onClick={() => router.push("/quiz/multiplayer/join")}
                className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/50 text-foregound"
            >
                <Users className="h-5 w-5" />
                <span>Join</span>
            </Button>
        </div>
    );
}
