"use client";

import { GameCard } from "./GamesCard";


const comingSoonGames = [
  {
    title: "PokeScribble",
    description: "Draw Pokémon and let others guess the Pokémon!",
  },
  {
    title: "PokeRiddle",
    description: "Solve riddles to guess the Pokémon Names!",
  },
  {
    title: "PokeType",
    description: "Master Pokémon type matchups in this strategic game!",
  },
];

export function ComingSoonGames() {
  return (
    <section>
      <h3 className="text-2xl md:text-3xl text-foreground font-bold mb-6">
        Coming Soon
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {comingSoonGames.map((game, index) => (
          <div key={index} className="relative">
            <GameCard {...game} />
            {/* Badge */}
            <span className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full shadow">
              Coming Soon
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
