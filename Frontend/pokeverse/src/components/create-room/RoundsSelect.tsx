import React from 'react';

const inputClass = 'w-full px-4 py-2 rounded-full bg-[#2e2e2e] placeholder-gray-400 text-white outline-none';

interface RoundsSelectProps {
  rounds: number;
  onRoundsChange: (value: number) => void;
}

export const RoundsSelect: React.FC<RoundsSelectProps> = ({ rounds, onRoundsChange }) => (
  <div className="w-full flex items-center">
    <label className="text-xl w-[100px]">Rounds</label>
    <select
      className={`${inputClass} w-[300px]`}
      value={rounds}
      onChange={(e) => onRoundsChange(Number(e.target.value))}
    >
      {[5, 10, 15, 20].map((val) => (
        <option key={val} value={val}>
          {val}
        </option>
      ))}
    </select>
  </div>
);