// UIComponents.tsx

import React from "react";
import { motion } from "framer-motion";

// Card Component
export const Card: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = "" }) => (
    <div
        className={`bg-background border border-foreground/10 rounded-xl ${className}`}
    >
        {children}
    </div>
);

// Button Component
export const Button: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "default" | "outline";
    className?: string;
}> = ({ children, onClick, variant = "default", className = "" }) => {
    const baseClass =
        "px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
    const variantClass =
        variant === "outline"
            ? "border border-foreground/20 hover:border-primary hover:bg-primary/5"
            : "bg-primary text-background hover:opacity-90";

    return (
        <button
            onClick={onClick}
            className={`${baseClass} ${variantClass} ${className}`}
        >
            {children}
        </button>
    );
};

// Progress Component
export const Progress: React.FC<{ value: number; className?: string }> = ({
    value,
    className = "",
}) => (
    <div
        className={`w-full bg-foreground/5 rounded-full overflow-hidden ${className}`}
    >
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full bg-primary"
        />
    </div>
);

// Badge Component
export const Badge: React.FC<{
    children: React.ReactNode;
    variant?: "default" | "outline";
}> = ({ children, variant = "outline" }) => {
    const variantClass =
        variant === "outline"
            ? "border border-foreground/20 bg-background"
            : "bg-primary text-background";

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variantClass}`}
        >
            {children}
        </span>
    );
};
