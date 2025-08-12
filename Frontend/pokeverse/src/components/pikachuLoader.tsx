import React, { useEffect } from "react";
import Image from "next/image";

const PikachuLoader = () => {
  // Disable scroll on mount, restore on unmount
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[99999]  flex items-center justify-center pointer-events-auto">
      <Image
        src="/pikachu-running.gif"
        alt="Pikachu running"
        width={100}
        height={100}
        className="object-contain h-[91vh] w-[100vw] backdrop-brightness-10 absolute top-[9vh] z-99999 left-0 "
        unoptimized={true}
      />
    </div>
  );
};

export default PikachuLoader;
