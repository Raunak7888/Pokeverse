import PokeButton from "@/components/PokemonButton";
import React from "react";

interface ResultProps {
  isCorrect: boolean;
  onNext: () => void;
}

const Result: React.FC<ResultProps> = ({ isCorrect, onNext }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-black text-white p-4 min-h-screen">
      <div className="flex flex-col items-center space-y-6 w-full max-w-2xl bg-[#1e1e1e] p-6 md:p-10 rounded-[4vh] shadow-lg">
        <div className="text-white text-5xl font-[Piedra] tracking-wide text-center">
          {isCorrect ? "Correct!" : "Oops, that's Incorrect"}
        </div>

        <div className="text-lg md:text-xl font-[Mogra] text-center">
          {isCorrect
            ? "Great job, you got the answer right!"
            : "Don't worry, try the next one!"}
        </div>

        <PokeButton buttonName="Next" onClick={onNext} />
      </div>
    </div>
  );
};

export default Result;
