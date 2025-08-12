import React from 'react';

const inputClass = 'w-full px-4 py-2 rounded-full bg-[#2e2e2e] placeholder-gray-400 text-white outline-none';

interface RoomNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const RoomNameInput: React.FC<RoomNameInputProps> = ({ value, onChange }) => (
  <div className="w-full flex items-center">
    <label className="text-xl w-[100px]">Name</label>
    <input
      type="text"
      placeholder="Name of the Room"
      className={inputClass}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);