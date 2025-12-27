"use client";

import { Around } from "@theme-toggles/react";
import * as React from "react";

export function ThemeToggle() {
    const [isToggled, setIsToggled] = React.useState(true);

    React.useEffect(() => {
        if (isToggled) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
    }, [isToggled]);

    return (
        <Around
            duration={750}
            placeholder={<div className="w-8 h-8 rounded-full bg-gray-300" />}
            className="scale-180"
            onToggle={() => setIsToggled(!isToggled)}
        />
    );
}
