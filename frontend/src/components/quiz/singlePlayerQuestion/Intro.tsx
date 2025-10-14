"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

const Intro = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { scale: 0, rotate: 0 },
        visible: {
          scale: [0, 1], // first scale up then settle
          rotate: [0,360],  // keep rotation fixed during first step
          transition: {
            duration: 0.5, // first stage
            ease: "easeInOut",
          },
        },
        exit: {
          scale: [1, 0], // shrink to disappear
          rotate: [0, -360], // rotate anticlockwise while shrinking
          transition: {
            duration: 0.5,
            ease: "easeInOut",
          },
        },
      }}
      className="flex items-center justify-center "
    >
      <Image
        src="/pokeball.png"
        alt="intro"
        width={350}
        height={350}
        priority
      />
    </motion.div>
  );
};

export default Intro;
