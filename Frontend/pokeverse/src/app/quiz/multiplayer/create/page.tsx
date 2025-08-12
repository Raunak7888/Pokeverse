"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import { useCreateRoom } from '@/lib/hooks/useCreateRoom';
import { RoomNameInput } from '@/components/create-room/RoomNameInput';
import { PlayerCountStepper } from '@/components/create-room/PlayerCountStepper';
import { RoundsSelect } from '@/components/create-room/RoundsSelect';
import Modal from '@/components/modal';
import PikachuLoader from '@/components/pikachuLoader';
import PokeButton from '@/components/PokemonButton';

const CreatePage = () => {
  const user = useUser();
  const { createRoom, isLoading, error, setError } = useCreateRoom();

  const [roomName, setRoomName] = useState('');
  const [playerCount, setPlayerCount] = useState(2);
  const [rounds, setRounds] = useState(5);

  useEffect(() => {
    // Clear localStorage when the component mounts
    localStorage.clear();
  }, []);

  const handlePlayerCountChange = (delta: number) => {
    setPlayerCount((prev) => Math.min(10, Math.max(2, prev + delta)));
  };

  const handleCreateClick = () => {
    if (!user) {
      setError('You must be logged in to create a room.');
      return;
    }
    createRoom({ roomName, playerCount, rounds, user });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-white font-[Piedra] tracking-widest">
      <h1 className="text-4xl font-bold mb-10">Create Room</h1>
      {isLoading && <PikachuLoader />}

      <div className="bg-[#1e1e1e] p-10 rounded-3xl shadow-xl w-[500px] flex flex-col gap-6 items-center">
        <RoomNameInput value={roomName} onChange={setRoomName} />
        <PlayerCountStepper playerCount={playerCount} onPlayerCountChange={handlePlayerCountChange} />
        <RoundsSelect rounds={rounds} onRoundsChange={setRounds} />
        <div onClick={handleCreateClick}>
          <PokeButton buttonName="Create" />
        </div>
      </div>

      <Modal
        message={error || ''}
        isOpen={!!error}
        onClose={() => setError(null)}
      />
    </div>
  );
};

export default CreatePage;