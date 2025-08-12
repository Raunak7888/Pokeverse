"use client";
import React from "react";

interface PokeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  buttonName: string;
}

export default function PokeButton({ buttonName, ...rest }: PokeButtonProps) {
  return (
    <button
      className="flex justify-center items-center gap-0 w-full border-none bg-transparent p-0"
      {...rest}
    >
      <div className="flex flex-col items-center w-[180px] sm:w-[200px] pointer-events-none">
        {/* Top red part */}
        <div className="h-[20px] sm:h-[24px] w-full rounded-t-4xl border-black border-2 bg-[#EE4035]" />

        {/* Middle text section */}
        <div className="bg-[#1e1e1e] h-[10px] sm:h-[14px] w-full text-white z-10 flex justify-center items-center border-x-2 border-black">
          <div
            className="text-2xl sm:text-3xl tracking-widest font-extrabold font-[Piedra] pointer-events-none"
            style={{
              textShadow:
                "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
              color: "white",
            }}
          >
            {buttonName}
          </div>
        </div>

        {/* Bottom white part */}
        <div className="bg-white h-[20px] sm:h-[24px] w-full rounded-b-4xl border-black border-2" />
      </div>
    </button>
  );
}
