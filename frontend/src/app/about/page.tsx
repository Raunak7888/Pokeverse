"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";

export default function Page() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Define variants with explicit Type to satisfy TypeScript
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 30,
            filter: "blur(10px)",
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                duration: 0.8,
                // The fix: "as const" tells TS this is a specific 4-number tuple
                ease: [0.22, 1, 0.36, 1] as const,
            },
        },
    };

    const floatingVariants: Variants = {
        animate: {
            y: [0, -15, 0],
            transition: {
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
    };

    if (!isMounted) return null;

    return (
        <main className="relative w-screen h-screen flex flex-col justify-center items-center overflow-hidden bg-background px-6 ">
            {/* Ambient Background */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.03, 0.07, 0.03],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full border-[1px] border-primary/20"
                />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl w-full flex flex-col items-center text-center space-y-8"
            >
                <motion.p
                    variants={itemVariants}
                    className="text-xs md:text-sm font-medium tracking-[0.4em] text-foreground/50 uppercase"
                >
                    Developed by
                </motion.p>

                <motion.div variants={itemVariants} className="group relative">
                    <motion.h1
                        whileHover={{ scale: 1.02 }}
                        className="text-5xl sm:text-7xl md:text-9xl font-bold tracking-tighter text-primary cursor-default"
                    >
                        <Link
                            href="https://linktr.ee/raunak7888"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center space-x-3 text-foreground/90 hover:text-primary transition-colors duration-300"
                        >
                            Raunak Yadav
                        </Link>
                        <div className="absolute -bottom-1 left-0 w-0 h-1 bg-primary transition-all duration-500 group-hover:w-full" />
                    </motion.h1>
                    <div className="absolute inset-0 bg-primary/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                </motion.div>

            </motion.div>

            {/* Background Particles */}
            <AnimatePresence>
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        variants={floatingVariants}
                        animate="animate"
                        initial={{
                            opacity: 0,
                            x: `${Math.random() * 100}%`,
                            y: `${Math.random() * 100}%`,
                        }}
                        whileInView={{ opacity: 0.15 }}
                        className="absolute w-1 h-1 md:w-2 md:h-2 bg-primary rounded-full blur-sm -z-20"
                        style={{
                            left: 0,
                            top: 0,
                        }}
                    />
                ))}
            </AnimatePresence>
        </main>
    );
}
