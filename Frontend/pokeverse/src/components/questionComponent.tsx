import React, { useState } from "react";
import Pokeball from "@/components/pokeball";
import OptionButton from "@/components/optionButton";
import PokeButton from "@/components/PokemonButton";
import { useClock } from "@/components/GameClockContext";

const QuestionComponent = ({
  questionNumber,
  questionText,
  optionsText,
  onSelect,
  onSubmit,
  duration = 0,
  isTimebound = false,
}: any) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // ✅ Only call useClock if timebound
  const clockData = isTimebound ? useClock() : null;
  const elapsed = clockData?.elapsed ?? 0;

  const remaining = Math.max(0, duration - elapsed);
  const percentage =
    isTimebound && duration > 0 ? (remaining / duration) * 100 : 100;

  const getClockColor = () => {
    if (percentage > 66) return "#ffffff";
    if (percentage > 33) return "#dddddd";
    return "#aaaaaa";
  };

  const handleOptionClick = (optionText: string) => {
    const newSelection = selectedOption === optionText ? null : optionText;
    setSelectedOption(newSelection);
  };


  const handleSubmit = () => {
    if (selectedOption) {
      onSelect(selectedOption);
      onSubmit?.();
    }
  };

  return (
    <div className="relative flex items-center ml-9 justify-center p-[5px]">
      <div
        className="rounded-[5vh] w-[71vw] h-[66vh] flex items-center justify-center"
        style={{
          background: isTimebound
            ? `conic-gradient(${getClockColor()} ${percentage}%, transparent ${percentage}%)`
            : "none",
        }}
      >
        <div className="bg-black rounded-[5vh]">
          <div className="relative z-10 flex flex-col items-center justify-center bg-black text-white rounded-[5vh] shadow-lg w-[80vw] sm:w-[70vw] overflow-hidden">
            <div className="flex flex-col items-center space-y-4 bg-[#1e1e1e] p-6 rounded-[5vh] shadow-lg w-full">
              <div className="flex items-center justify-center sm:justify-start gap-8 bg-[#3C3C3C] p-4 w-full rounded-full">
                <div className="relative sm:left-[0.7vw] sm:top-[0.7vh]">
                  <Pokeball
                    Text={String(questionNumber)}
                    size={100}
                    css="sm:right-[1.7rem] sm:bottom-[-1.3rem]"
                  />
                </div>
                <div className="bg-[#575757] px-6 py-4 sm:p-5 rounded-full text-lg sm:text-xl font-semibold">
                  {questionText}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                {(["A", "B", "C", "D"] as const).map((key) => {
                  const optionText = optionsText[key];
                  return (
                    <OptionButton
                      key={key}
                      optionKey={key}
                      text={optionText}
                      imageSrc={
                        key === "A"
                          ? "/croped-pikachu.png"
                          : key === "B"
                          ? "/croped-charmander.png"
                          : key === "C"
                          ? "/croped-squirtle.png"
                          : "/croped-bulbasaur.png"
                      }
                      selectedOption={selectedOption}
                      onOptionClick={() => handleOptionClick(optionText)} // ✅ Pass text, not key
                    />
                  );
                })}
              </div>

              <PokeButton
                buttonName="Submit"
                onClick={handleSubmit}
                disabled={!selectedOption}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionComponent;
