"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [isToggled, setIsToggled] = React.useState(true);

  // Sync body class with dark mode
  React.useEffect(() => {
    if (isToggled) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isToggled]);

  return (
    <Button
      className="rounded-full text-white bg-primary shadow-none scale-[2] w-10 h-7 m-1 z-5"
      onClick={() => setIsToggled(!isToggled)}
    >
      {isToggled ? <Sun fill="white"/>:<Moon fill="white" />}
    </Button>
  );
}
