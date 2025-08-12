import React from 'react';

// Assuming StepperButton is defined elsewhere as in your original code

interface PlayerCountStepperProps {
  playerCount: number;
  onPlayerCountChange: (delta: number) => void;
}

export const PlayerCountStepper: React.FC<PlayerCountStepperProps> = ({ playerCount, onPlayerCountChange }) => (
    <div className="w-full flex items-center">
    <label className="text-xl w-[100px]">Players</label>
    <div className="flex items-center gap-2">
        {/* You would import and use your StepperButton here */}
        <button onClick={() => onPlayerCountChange(-1)}>-</button>
        <span className="text-white text-sm w-10 text-center">{playerCount}</span>
        <button onClick={() => onPlayerCountChange(1)}>+</button>
    </div>
    </div>
);