"use client";

import { AvailableGames } from "./AvailableGames";
import { ComingSoonGames } from "./ComingSoonGames";

export function GamesSection() {
  return (
    <section
      id="games"
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-16 md:px-20 bg-background"
    >
      {/* Section Title */}
      <h2 className="text-4xl md:text-5xl text-foreground font-krona font-bold mb-12 text-center">
        Explore Games
      </h2>

      {/* Games */}
      <div className="w-full max-w-6xl space-y-16">
        <AvailableGames />
        <ComingSoonGames />
      </div>
    </section>
  );
}
