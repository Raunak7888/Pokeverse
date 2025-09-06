"use client";

import React from "react";
import Pokeball from "@/components/pokeball";
import OptionButton from "@/components/optionButton";
import PokeButton from "@/components/PokemonButton";
import { motion } from "framer-motion";
import { QuestionComponentProps } from "@/utils/types";

const QuestionComponent = ({
  questionNumber,
  questionText,
  optionsText,
  selectedOption,
  onSelect,
  onSubmit,
  isTimebound = false,
  endTime, // absolute timestamp from server
}: QuestionComponentProps) => {
  // ✅ Only useClock if timebound

  const remaining = isTimebound && endTime ? Math.max(0, endTime - Date.now()) : 0;

  const percentage =
    isTimebound && endTime
      ? (remaining / (endTime - (endTime - 30_000))) * 100 // assumes 30s window
      : 100;

  const getClockColor = () => {
    if (percentage > 66) return "#22c55e";
    if (percentage > 33) return "#facc15";
    return "#ef4444";
  };

  const handleOptionClick = (optionText: string) => {
    const newSelection = selectedOption === optionText ? null : optionText;
    onSelect(newSelection);
  };

  const handleSubmit = () => {
    if (selectedOption) {
      onSubmit?.();
    }
  };

  return (
    <div className="relative flex items-center justify-center p-4">
      <div
        className="rounded-[5vh] w-[72vw] sm:w-[60vw] h-[68vh] p-3 flex items-center justify-center transition-all duration-500"
        style={{
          background: isTimebound
            ? `conic-gradient(${getClockColor()} ${percentage}%, transparent ${percentage}%)`
            : "none",

        }}
      >
        <div className="w-full h-full flex items-center rounded-[5vh] justify-center"
          style={{
            backgroundColor: isTimebound ? "#1a1a1a" : "transparent",
          }}
        >
          <div className="relative z-10 flex flex-col items-center justify-center p-10 text-white shadow-lg w-[85vw] sm:w-[65vw] overflow-hidden">
            {/* Question Header */}
            <div className="flex items-center gap-6 bg-[#2c2c2c] p-4 w-full rounded-4xl shadow-md"
             
            >
              <div className="relative flex-shrink-0">
                <Pokeball
                  Text={String(questionNumber)}
                  size={90}
                  css="right-[1rem] bottom-[-1rem]"
                />
              </div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#444] px-5 py-3 rounded-4xl text-lg sm:text-xl font-semibold leading-snug flex-1 text-center sm:text-left"
              >
                {questionText}
              </motion.div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4 mt-8 w-full">
              {(["A", "B", "C", "D"] as const).map((key, idx) => {
                const optionText = optionsText[key];
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <OptionButton
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
                      onOptionClick={() => handleOptionClick(optionText)}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Submit Button */}
            <motion.div
              className="mt-10 rounded-4xl"
              animate={
                selectedOption
                  ? { scale: [1, 1.05, 1], boxShadow: "0 0 20px #facc15" }
                  : { scale: 1, boxShadow: "none" }
              }
              transition={{ repeat: selectedOption ? Infinity : 0, duration: 1.5 }}
            >
              <PokeButton
                buttonName="Submit"
                onClick={handleSubmit}
                disabled={!selectedOption}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionComponent;
