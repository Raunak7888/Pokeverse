"use client";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") return null;
  if (pathname === "/quiz/multiplayer/question") return null;

  return (
    <button
      onClick={() => router.back()}
      className="group absolute top-25 left-10 z-50 h-12 w-12 bg-[#2e2e2e] text-white rounded-full shadow hover:bg-white hover:text-black hover:w-23 transition-all duration-300 flex items-center overflow-hidden pl-3 pr-4"
    >
      <ChevronLeft size={25} className="flex-shrink-0" />
      <span className="ml-2 whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:ml-2 transition-all duration-300">
        Back
      </span>
    </button>
  );
}
