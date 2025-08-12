"use client";

import { FcGoogle } from "react-icons/fc";
export default function Auth() {
  async function handleGoogleLogin(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): Promise<void> {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:8082/auth/login", {
        credentials: "include", // Needed if cookies are involved
      });
      const data = await response.json();
      if (data.message) {
        window.location.href =
          "http://localhost:8082/oauth2/authorization/google";
      } else {
        console.error("Unexpected response:", data);
      }
    } catch (error) {
      console.error("Google login failed:", error);
    }
  }


  return (
    <div className="p-5 h-screen bg-[#1f1f1f] flex items-center justify-center">
      <div className="w-full bg-[#1f1f1f] h-full rounded-lg overflow-hidden shadow-lg">
        {/* Top Red Section */}
        <div className="bg-[#ef3f3f] h-[45%] text-center rounded-t-lg flex flex-col justify-center items-center ">
          <h1 className="text-white tracking-extreme text-4xl md:text-5xl font-bold font-[Krona_One]">
            WELCOME TO POKEVERSE
          </h1>
          <p className="text-white mt-10 text-xl font-medium font-[Aclonica]">
            Login <span className="font-bold">OR</span> Register to get started
          </p>
        </div>

        {/* Pokéball Stripe and Google Button */}
        <div className="relative bg-black h-20 flex justify-center items-center">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {/* Outer Circle Behind the Google Logo */}
            <div className="bg-white border-[10px] border-black w-40 h-40 rounded-full mb-2 flex items-center justify-center">
              {/* Inner Circle with Google Logo */}
              <div
                className="bg-white border-[2px] border-black rounded-full p-2 w-24 h-24 flex items-center justify-center"
                onClick={handleGoogleLogin}
              >
                <FcGoogle size={60}/>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom White Section */}
        <div className="bg-white py-6 px-4 rounded-b-lg flex items-center justify-center h-[45%]">
          <p className="absolute top-[90%] text-sm text-black font-semibold text-center font-[Aclonica]">
            By continuing, you agree to the Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
