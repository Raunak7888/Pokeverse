"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
    const [mounted, setMounted] = React.useState(false);
    const [isToggled, setIsToggled] = React.useState(true); 
    React.useEffect(() => {
        setMounted(true); // <-- Marks the component as hydrated/mounted
    }, []);

    React.useEffect(() => {
        if (isToggled) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
    }, [isToggled]);

    if (!mounted) {
        return null;
    }

    return (
        <Button
            className="rounded-full text-white bg-primary shadow-none scale-[1.75] w-7 h-7 m-1 z-5"
            onClick={() => setIsToggled(!isToggled)}
        >
            {isToggled ? <Sun fill="white" /> : <Moon fill="white" />}
        </Button>
    );
}