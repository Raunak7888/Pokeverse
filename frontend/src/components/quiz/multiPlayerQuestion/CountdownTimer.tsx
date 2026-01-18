"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function StartCountdown({
    secondsBeforeStart = 3,
    onExpire,
}: {
    secondsBeforeStart?: number;
    onExpire: () => void;
}) {
    const [count, setCount] = useState(secondsBeforeStart);

    useEffect(() => {
        if (count <= 0) {
            const timeout = setTimeout(() => {
                onExpire();
            }, 500);
            return () => clearTimeout(timeout);
        }

        const timer = setInterval(() => {
            setCount((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [count, onExpire]);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 ">
            <div className="relative flex flex-col items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={count}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: 1 }}
                        exit={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-8xl md:text-9xl font-black text-primary drop-shadow-2xl"
                    >
                        {count > 0 ? count : "GO!"}
                    </motion.div>
                </AnimatePresence>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xl uppercase tracking-[0.3em] font-bold mt-8 text-muted-foreground"
                >
                    Get Ready
                </motion.p>
            </div>
        </div>
    );
}
