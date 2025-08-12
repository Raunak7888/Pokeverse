"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

const Navbar = () => {
  const [userData, setUserData] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);

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

  const handleImageClick = () => {
    setShowDialog(!showDialog);
  };

  const handleClose = () => {
    setShowDialog(false);
  };

  const profilePictureUrl = "/person.png"; // fallback/default image

  return (
    <>
      <div className="bg-[#EE4035] tracking-widest h-16 flex items-center justify-between px-4 shadow-md">
        <div className="ml-4 text-white tracking-widest text-4xl md:text-3xl font-bold font-[Piedra]">
          POKEVERSE
        </div>
        <div className="flex items-center space-x-4 mr-4">
          <Link
            href="/"
            className="text-white md:text-xl font-bold font-[Piedra]"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-white md:text-xl font-bold font-[Piedra]"
          >
            About
          </Link>
          <Image
            src={userData?.profilePicUrl || profilePictureUrl}
            alt="Profile"
            width={40}
            height={40}
            className="m-0 p-0 border-[1px] border-white h-[40px] rounded-[50%] object-cover cursor-pointer"
            onClick={handleImageClick}
          />
        </div>
      </div>

      {/* Dialog Box */}
      {showDialog && userData && (
        <div className="flex rounded-b-2xl justify-end fixed end-0">
          <div className="bg-[#1b1b1b] rounded-b-4xl shadow-lg p-6 relative h-[150px] w-[350px]">
            <button
              onClick={handleClose}
              className="absolute top-2 right-3 text-gray-600 hover:text-red-500 text-xl font-bold"
            >
              &times;
            </button>
            <div className="flex flex-row items-center space-y-4">
              <div className="bg-white rounded-[50%] h-[110px] w-[110px]">
                <Image
                  src={userData?.profilePicUrl || profilePictureUrl}
                  alt="Profile"
                  width={100}
                  height={100}
                  className="rounded-[50%] border-[2px] h-[110px] w-[110px] border-gray-300 object-contain"
                />
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="text-lg text-white font-bold">
                  {userData.name}
                </div>
                <div className="text-sm text-white">{userData.email}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
