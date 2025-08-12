import { ReactNode } from "react";
import "./globals.css";
import BackButton from "@/components/backbutton";

export const metadata = {
  title: "PokeVerse",
  description: "Welcome to the Pokémon universe!",
};

export default function RootLayout({ children }: { children: ReactNode }) {
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
        <title>PokeVerse</title>
      </head>
      <body>
        <BackButton /> {/* 👈 Always visible back button */}
        {children}
      </body>
    </html>
  );
}
