"use client";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { BACKEND_URL } from "../utils/backendUrl";

export const SignInDialog = () => {
    const handleGoogleLogin = () => {
        window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
    };

    return (
        <DialogHeader className="flex flex-col items-center px-4 sm:px-6 md:px-8 py-6 space-y-4">
            <DialogTitle className="font-krona font-bold text-center leading-tight">
                <span className="block text-base sm:text-lg md:text-xl text-foreground">
                    Sign in to
                </span>
                <span className="block text-3xl sm:text-4xl md:text-5xl text-primary">
                    Pokeverse
                </span>
            </DialogTitle>

            <p className="text-center text-foreground font-aclonica text-sm sm:text-base md:text-lg mb-6">
                Join the adventure!
            </p>

            <Button
                variant="outline"
                className="w-full max-w-xs py-2 px-4 flex items-center text-foreground justify-center gap-2 text-sm sm:text-md font-semibold border-foreground hover:bg-gray-50"
                onClick={handleGoogleLogin}
            >
                <FcGoogle className="h-5 w-5 flex-shrink-0" />
                <span className="truncate ">Login with Google</span>
            </Button>
        </DialogHeader>
    );
};
