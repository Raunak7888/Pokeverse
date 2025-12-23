"use client";

import MultiplayerUserHistory from "@/components/quiz/multiPlayerQuestion/PreviousGames";

// Dummy Data for Preview/Testing

// The actual state is nested under "state"

export default function Page() {
    return (
        <div className="flex justify-center items-center w-screen h-screen bg-background text-foreground">
            <MultiplayerUserHistory />
        </div>
    );
}
