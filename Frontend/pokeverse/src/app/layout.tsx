// src/app/layout.tsx
import { ReactNode } from "react";
import "./globals.css";
import {
  Krona_One,
  Outfit,
  Aclonica,
  Mogra,
  Modak,
  Lemon,
  Piedra,
  Poetsen_One,
} from "next/font/google";

const krona = Krona_One({ weight: "400", subsets: ["latin"], variable: "--font-krona" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const aclonica = Aclonica({ weight: "400", subsets: ["latin"], variable: "--font-aclonica" });
const mogra = Mogra({ weight: "400", subsets: ["latin"], variable: "--font-mogra" });
const modak = Modak({ weight: "400", subsets: ["latin"], variable: "--font-modak" });
const lemon = Lemon({ weight: "400", subsets: ["latin"], variable: "--font-lemon" });
const piedra = Piedra({ weight: "400", subsets: ["latin"], variable: "--font-piedra" });
const poetsen = Poetsen_One({ weight: "400", subsets: ["latin"], variable: "--font-poetsen" });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      {/* Apply Outfit as the default font, plus register others via CSS vars */}
      <body
        className={`${outfit.className} ${krona.variable} ${aclonica.variable} ${mogra.variable} ${modak.variable} ${lemon.variable} ${piedra.variable} ${poetsen.variable} bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
