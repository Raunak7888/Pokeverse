"use client";
import Navbar from "@/components/Navbar";
import PokeButton from "@/components/PokemonButton";
import React, { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { FaGamepad, FaGithub } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";

const games = [
  {
    title: "Poke Quiz",
    description:
      "Test your Pokémon knowledge with fun quizzes covering types, moves, evolutions, and more.",
    image: "",
    isAvailable: true,
    link: "/quiz",
  },
  {
    title: "Poke Scribble",
    description:
      "Draw Pokémon and have friends guess — or guess theirs — in this creative scribble challenge.",
    image: "",
    isAvailable: false,
    link: "/scribble",
  },
  {
    title: "Poke Matrix",
    description:
      "Match Pokémon tiles in a matrix puzzle before time runs out. Fast-paced and addictive!",
    image: "",
    isAvailable: false,
    link: "/matrix",
  },
  {
    title: "PokeDex",
    description:
      "Explore an interactive Pokédex with detailed stats, abilities, and evolution info for every Pokémon.",
    image: "",
    isAvailable: false,
    link: "/dex",
  },
  {
    title: "Team Builder",
    description:
      "Create your ultimate Pokémon battle team and test strategies against AI or friends.",
    image: "",
    isAvailable: false,
    link: "/builder",
  },
];


const HomePage: React.FC = () => {
  const controls = useAnimation();
  const [direction, setDirection] = useState(1); // 1 = left to right, -1 = right to left
  const navigate = useRouter();
  // Start scrolling
  const startScrolling = async (dir: number) => {
    setDirection(dir);
    controls.start({
      x: dir === 1 ? ["0%", "-50%"] : ["-50%", "0%"],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 12,
          ease: "linear",
        },
      },
    });
  };

  // Stop scrolling
  const stopScrolling = () => {
    controls.stop();
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-inter flex flex-col">
      {/* Navbar */}
      <div className="bg-[#1f1f1f] fixed top-0 left-0 right-0 z-50 shadow-md">
        <Navbar />
      </div>

      {/* Hero Section */}
      <header className="relative w-full h-[93vh] flex flex-col justify-center items-center text-center px-4 mt-14">
        <h1 className="text-6xl md:text-7xl font-bold font-krona mb-4">
          WELCOME TO <span className="text-red-600">POKEVERSE</span>
        </h1>
        <p className="text-xl md:text-2xl my-8 font-poetsen">
          Dive into Pokemon-inspired games, quizzes, and adventures
        </p>
        <div className="flex space-x- mt-8">
          <PokeButton
            buttonName="Get Started"
            width={250}
            topHeight={24}
            middleHeight={14}
            bottomHeight={24}
            fontSize={24}
            textFont="Lemon"
            onClick={() => navigate.push("/auth")}
          />
          <button className="px-6 py-3 border w-[300px] border-white text-white rounded-3xl shadow-lg hover:bg-white hover:text-black
           transition-colors duration-300 font-lemon"
            onClick={() => {
              const gamesSection = document.querySelector("#games");
              if (gamesSection) {
                gamesSection.scrollIntoView({ behavior: "smooth" });
              }
            }}>
            Explore Games
          </button>
        </div>
      </header>

      {/* Our Games Carousel */}
      <section className="py-16 relative px-6 h-[85vh] w-[100vw] overflow-hidden">
        <h2 id="games" className="text-4xl font-krona text-center mb-28">
          Our Games
        </h2>

        {/* Hover zones */}
        <div
          className="absolute bg-black top-0 left-0 w-[25%] h-full z-20"
          onMouseEnter={() => startScrolling(-1)}
          onMouseLeave={stopScrolling}
        />
        <div
          className="absolute bg-black top-0 right-0 w-[25%] h-full z-20"
          onMouseEnter={() => startScrolling(1)}
          onMouseLeave={stopScrolling}
        />

        {/* Carousel track */}
        <motion.div
          className="flex gap-8"
          animate={controls}
          onMouseEnter={stopScrolling}
          onMouseLeave={() => startScrolling(direction)}
        >
          {[...games, ...games].map((game, index) => (
            <div
              key={index}
              className="bg-[#1e1e1e] min-w-[280px] rounded-2xl shadow-lg hover:shadow-red-600/40 hover:scale-105 transition-transform duration-300"
            >
              <div className="h-48 bg-black border-10 border-[#1e1e1e] rounded-t-2xl flex items-center justify-center">
                {game.image ? (
                  <Image
                    src={game.image}
                    alt={game.title}
                    width={400} // required
                    height={192} // required
                    className="object-cover h-full w-full rounded-t-2xl"
                  />
                ) : (
                  <FaGamepad className="text-5xl text-gray-500 group-hover:text-red-500 transition-colors duration-300" />
                )}
              </div>
              <div className="p-5 flex flex-col justify-between h-56">
                <h3 className="text-xl font-semibold font-poetsen mb-2">
                  {game.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 font-[Modra]">{game.description}</p>
                {game.isAvailable ? (
                  <PokeButton
                    buttonName="Play Now"
                    width={200}
                    topHeight={20}
                    middleHeight={10}
                    bottomHeight={20}
                    fontSize={20}
                    textFont="Lemon"
                    onClick={() => {
                      navigate.push(game.link);
                    }}
                  />) : (
                  <PokeButton
                    buttonName="Coming Soon"
                    width={200}
                    topHeight={20}
                    middleHeight={10}
                    bottomHeight={20}
                    fontSize={18}
                    textFont="Lemon"
                    topColor="#3e3e3e"
                  />
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111] text-gray-400 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm font-poetsen">
            © {new Date().getFullYear()} Pokeverse. All rights reserved.
          </p>
          <div className="flex space-x-6 text-lg">
            <a href="https://github.com/Raunak7888/Pokeverse" target="_blank" className="hover:text-white transition-colors duration-300">
              <FaGithub />
            </a>


          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
