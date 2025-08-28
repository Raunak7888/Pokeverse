'use client';
import { ReactNode, useEffect } from "react";
import "./globals.css";
import BackButton from "@/components/backbutton";
import useTokenRefresh from "@/lib/hooks/useTokenRefresh";

export default function RootLayout({ children }: { children: ReactNode }) {
  // useTokenRefresh();
  return (
    <html lang="en">
      <head>
        {/* Google Fonts */}


        <link
          href="https://fonts.googleapis.com/css2?family=Piedra&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Krona+One&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Aclonica&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Mogra&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Monda:wght@400..700&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lemon&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poetsen+One&display=swap" rel="stylesheet" />
            <title>PokeVerse</title>
          </head>
          <body>
            {/* <BackButton /> 👈 Always visible back button */}
            {children}
          </body>
        </html>
        );
}
