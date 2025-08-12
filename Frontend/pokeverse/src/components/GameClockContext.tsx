import React, { createContext, useContext, useEffect, useState } from "react";

interface ClockContextType {
  elapsed: number;
  startTime: number;
  duration: number;
}

// Creating the context
const ClockContext = createContext<ClockContextType | undefined>(undefined);

// Custom hook to use the clock context
export const useClock = () => {
  const context = useContext(ClockContext);
  if (!context) {
    throw new Error("useClock must be used within a ClockProvider");
  }
  return context;
};

// ClockProvider component
export const ClockProvider: React.FC<
  React.PropsWithChildren<{ duration: number; start: boolean }> // Add start prop
> = ({ children, duration, start }) => {
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState(0); // Will store the actual start time

  useEffect(() => {
    if (start) {
      setStartTime(Date.now()); // Set the start time when start is true
    }
  }, [start]);

  useEffect(() => {
    if (!start) return; // Don't start the timer if start is false

    const interval = setInterval(() => {
      setElapsed(Math.max(0, (Date.now() - startTime) / 1000)); // Update elapsed time
    }, 100); // Update every 100 ms

    return () => clearInterval(interval); // Clean up the interval when the component is unmounted
  }, [start, startTime]);

  return (
    <ClockContext.Provider value={{ elapsed, startTime, duration }}>
      {children}
    </ClockContext.Provider>
  );
};
