import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/navbar/navbar";
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
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const krona = Krona_One({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-krona",
});
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const aclonica = Aclonica({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-aclonica",
});
const mogra = Mogra({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-mogra",
});
const modak = Modak({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-modak",
});
const lemon = Lemon({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-lemon",
});
const piedra = Piedra({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-piedra",
});
const poetsen = Poetsen_One({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-poetsen",
});

export const metadata: Metadata = {
    title: "Pokeverse",
    description: "A Pokémon-themed games playground",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="overflow-x-hidden scrollbar-thin
                                            scrollbar-thumb-foreground/60
                                            scrollbar-track-foreground/10

                                            hover:scrollbar-thumb-foreground/80

                                            [&::-webkit-scrollbar]:w-1.5
                                            [&::-webkit-scrollbar-track]:rounded-full
                                            [&::-webkit-scrollbar-track]:bg-foreground/10
                                            [&::-webkit-scrollbar-thumb]:rounded-full
                                            [&::-webkit-scrollbar-thumb]:bg-foreground/60
                                            hover:[&::-webkit-scrollbar-thumb]:bg-foreground/80">
            <body
                className={`${outfit.className} ${krona.variable} ${aclonica.variable} ${mogra.variable} ${modak.variable} ${lemon.variable} ${piedra.variable} ${poetsen.variable} antialiased dark bg-background`}
            >
                <TooltipProvider>
                    <Navbar />
                    {children}
                    <Toaster position="top-center" />
                </TooltipProvider>
            </body>
        </html>
    );
}
