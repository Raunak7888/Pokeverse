"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {User } from "@/utils/types";

const Navbar = () => {
  const [userData, setUserData] = useState<User|null>(null);

  useEffect(() => {
    const rawData = Cookies.get("user");
    if (rawData) {
      try {
        const parsedData = JSON.parse(rawData);
        setUserData(parsedData);
      } catch (err) {
        console.error("Invalid JSON in cookie:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("user");
    setUserData(null);
    window.location.href = "/";
  };

  const profilePictureUrl = "/person.png";

  return (
    <nav className="bg-[#EE4035] tracking-widest h-16 flex items-center justify-between px-4 shadow-md">
      {/* Logo */}
      <div className="ml-4 text-white tracking-widest text-3xl md:text-4xl font-bold font-piedra">
        POKEVERSE
      </div>

      {/* Links + Profile */}
      <div className="flex items-center space-x-6 mr-4">
        <Link
          href="/"
          className="text-white md:text-lg font-bold font-piedra hover:underline underline-offset-4"
        >
          Home
        </Link>
        <Link
          href="/quiz"
          className="text-white md:text-lg font-bold font-piedra hover:underline underline-offset-4"
        >
          PokeQuiz
        </Link>
        <Link
          href="/about"
          className="text-white md:text-lg font-bold font-piedra hover:underline underline-offset-4"
        >
          About
        </Link>

        {/* Profile / Login */}
        {userData ? (
          <Dialog>
            <DialogTrigger asChild>
              <Image
                src={userData.profilePicUrl || profilePictureUrl}
                alt="Profile"
                width={42}
                height={42}
                className="border-2 border-white rounded-full cursor-pointer object-cover"
              />
            </DialogTrigger>
            <DialogContent className="bg-[#1b1b1b] text-white max-w-sm rounded-2xl p-6 border border-gray-700">
              {/* Accessibility helpers */}
              <DialogTitle>
                <VisuallyHidden>User Profile</VisuallyHidden>
              </DialogTitle>
              <DialogDescription>
                <VisuallyHidden>
                  Shows the user’s account details and logout option.
                </VisuallyHidden>
              </DialogDescription>

              {/* Animated Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col items-center space-y-4"
              >
                {/* Profile Pic */}
                <div className="w-28 h-28 rounded-full border-4 border-[#EE4035] shadow-lg overflow-hidden">
                  <Image
                    src={userData.profilePicUrl || profilePictureUrl}
                    alt="Profile"
                    width={112}
                    height={112}
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Name + Email */}
                <div className="text-center">
                  <h2 className="text-xl font-bold">{userData.username}</h2>
                  <p className="text-sm text-gray-400">{userData.email}</p>
                </div>

                {/* Logout */}
                <Button
                  variant="destructive"
                  className="flex items-center gap-2 w-full hover:border-2 hover:scale-105 transition-all cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  Logout
                </Button>
              </motion.div>
            </DialogContent>
          </Dialog>
        ) : (
          <Link
            href="/auth"
            className="text-white md:text-lg font-bold font-piedra hover:underline underline-offset-4"
          >
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
