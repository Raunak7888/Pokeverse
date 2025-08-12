"use client";
import React from "react";
import Image from "next/image";

interface PokeballProps {
  Text: string;
  size?: number;
  css?: string;
}

const Pokeball: React.FC<PokeballProps> = ({ Text, size = 200, css = "" }) => {
  const textSize = size / 2;

  return (
    <div
      className="relative inline-block"
      style={{ width: size, height: size }}
    >
      {/* Pokeball Image */}
      <Image
        src="/pokeball.png"
        alt="Pokeball"
        width={size}
        height={size}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />

      {/* Centered Text */}
      <span
        className={`absolute top-1/2 left-1/2 ${css} transform -translate-x-1/2 -translate-y-1/2 font-bold font-[Piedra] text-white`}
        style={{
          fontSize: `${textSize}px`,
          textShadow: "4px 4px 10px rgba(0, 0, 0, 0.8)",
        }}
      >
        {Text}
      </span>
    </div>
  );
};

export default Pokeball;
