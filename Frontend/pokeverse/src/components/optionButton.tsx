"use client";
import React from "react";
import Image from "next/image";

interface OptionButtonProps {
  optionKey: string; // Can be used for labeling or debugging
  text: string;
  imageSrc?: string;
  selectedOption: string | null;
  onOptionClick: (optionText: string) => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  optionKey,
  text,
  imageSrc,
  selectedOption,
  onOptionClick,
}) => {
  const isSelected = selectedOption === text;

  return (
    <button
      onClick={() => onOptionClick(text)} // ✅ pass option *text*
      className={`flex items-center space-x-2 bg-[#3c3c3c] px-4 py-3 rounded-full w-full transition-all duration-200 ${
        isSelected ? "ring-4 ring-yellow-400" : ""
      }`}
    >
      {imageSrc ? (
        <div className="relative w-10 h-10 sm:w-12 sm:h-12">
          <Image
            src={imageSrc}
            alt={text}
            fill
            style={{ objectFit: "contain" }}
            sizes="32px"
            priority={false}
          />
        </div>
      ) : (
        <span className="text-2xl">❓</span>
      )}
      <div className="flex items-center space-x-2 bg-[#575757] p-3 rounded-full w-full">
        <span className="font-medium">{text}</span>
      </div>
    </button>
  );
};

export default OptionButton;
