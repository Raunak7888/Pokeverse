"use client";

import { GameCard } from "./GamesCard";


const availableGames = [
  {
    title: "PokeQuiz",
    description:
      "Test your Pokémon knowledge with our fun and challenging quiz game!",
    image: "/pokeQuiz.jpg",
    route: "/quiz",
  },
];

export function AvailableGames() {
  return (
    <section>
      <h3 className="text-2xl md:text-3xl text-primary font-bold mb-6">
        Available Games
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {availableGames.map((game, index) => (
          <GameCard key={index} {...game} />
        ))}
      </div>
    </section>
  );
}
