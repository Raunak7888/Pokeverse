"use client";
import React from "react";

interface PokeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  buttonName: string;

  // Size customization
  width?: string | number;
  topHeight?: string | number;
  middleHeight?: string | number;
  bottomHeight?: string | number;

  // Text customization
  textFont?: string;
  fontSize?: string | number;
  textColor?: string;
  textShadowColor?: string;

  // Color customization
  topColor?: string;
  middleColor?: string;
  bottomColor?: string;
  borderColor?: string;
  buttonCss?: string;
}

export default function PokeButton({
  buttonName,
  width = 180,
  topHeight = 20,
  middleHeight = 10,
  bottomHeight = 20,

  textFont = "Piedra",
  fontSize = 24,
  textColor = "white",
  textShadowColor = "#000",

  topColor = "#EE4035",
  middleColor = "#1e1e1e",
  bottomColor = "white",
  borderColor = "black",
  buttonCss = "",
  ...rest
}: PokeButtonProps) {
  return (
    <button
      className={`flex justify-center items-center gap-0 w-full border-none bg-transparent p-0 ${buttonCss}`}
      {...rest}
    >
      <div
        className="flex flex-col items-center pointer-events-none"
        style={{ width }}
      >
        {/* Top section */}
        <div
          style={{
            height: topHeight,
            width: "100%",
            borderRadius: "9999px 9999px 0 0",
            backgroundColor: topColor,
            border: `2px solid ${borderColor}`,
            borderBottom: "none",
          }}
        />

        {/* Middle text section */}
        <div
          style={{
            height: middleHeight,
            width: "100%",
            backgroundColor: middleColor,
            color: textColor,
            borderLeft: `2px solid ${borderColor}`,
            borderRight: `2px solid ${borderColor}`,
            zIndex: 10,
          }}
          className="flex justify-center items-center"
        >
          <div
            style={{
              fontSize,
              fontFamily: textFont,
              textShadow: `-2px -2px 0 ${textShadowColor}, 
                           2px -2px 0 ${textShadowColor}, 
                           -2px 2px 0 ${textShadowColor}, 
                           2px 2px 0 ${textShadowColor}`,
            }}
            className="font-extrabold tracking-widest pointer-events-none"
          >
            {buttonName}
          </div>
        </div>

        {/* Bottom section */}
        <div
          style={{
            height: bottomHeight,
            width: "100%",
            borderRadius: "0 0 9999px 9999px",
            backgroundColor: bottomColor,
            border: `2px solid ${borderColor}`,
            borderTop: "none",
          }}
        />
      </div>
    </button>
  );
}
