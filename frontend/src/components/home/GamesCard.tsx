// components/ui/GameCard.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GameCardProps {
    image?: string;
    title: string;
    description: string;
    route?: string;
}

export const GameCard: React.FC<GameCardProps> = ({
    image,
    title,
    description,
    route,
}) => {
    const router = useRouter();

    const handleButtonClick = () => {
        if (route) {
            router.push(route);
        }
    };

    const isButtonDisabled = !route;

    return (
        <Card
            className="
            w-[280px] sm:w-[300px] h-[420px] flex flex-col overflow-hidden
            rounded-2xl border-2 border-
            shadow-none hover:shadow-xl hover:-translate-y-2
        transition-all duration-300
      "
        >
            {/* Image Header */}
            <CardHeader className="p-0 relative">
                <div className="relative bottom-6 w-full h-48 border-7 border-transparent rounded-2xl overflow-hidden">
                    {image ? (
                        <Image
                            src={image}
                            alt={title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 text-white text-sm">
                            No Image
                        </div>
                    )}
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="flex-grow bottom-6 relative px-4 py-3">
                <CardTitle className="text-lg sm:text-xl font-bold text-foreground mb-2 line-clamp-1">
                    {title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground line-clamp-3">
                    {description}
                </CardDescription>
            </CardContent>

            {/* Footer */}
            <CardFooter className="px-4 pb-4 mt-auto">
                <Button
                    onClick={handleButtonClick}
                    disabled={isButtonDisabled}
                    className={`w-full rounded-lg bottom-6 relative font-semibold transition-all ${
                        isButtonDisabled
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg"
                    }`}
                >
                    {isButtonDisabled ? "Coming Soon" : "Play Now"}
                </Button>
            </CardFooter>
        </Card>
    );
};
