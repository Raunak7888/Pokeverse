import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from './useUser';

interface CreateRoomParams {
  roomName: string;
  playerCount: number;
  rounds: number;
  user: User;
}

export const useCreateRoom = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = async ({ roomName, playerCount, rounds, user }: CreateRoomParams) => {
    if (!roomName.trim()) {
      setError('Please enter a room name.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create the room
      const createRes = await fetch('http://localhost:8083/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName,
          hostId: user.id,
          maxPlayers: playerCount,
          maxRound: rounds,
        }),
      });

      const roomData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(roomData.message || 'Failed to create room.');
      }
      console.log(user.profilePicUrl);
      // Step 2: Join the newly created room
      const joinRes = await fetch(`http://localhost:8083/api/rooms/join?roomId=${roomData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: user.name,
          profilePicUrl: user.profilePicUrl,
        }),
      });

      if (!joinRes.ok) {
        const joinResult = await joinRes.text();
        throw new Error(`Room created, but failed to join: ${joinResult}`);
      }

      // Step 3: Fetch final room and player data
      const dataResponse = await fetch(`http://localhost:8083/api/rooms/${roomData.id}/${user.id}`);
      if (!dataResponse.ok) {
        throw new Error('Failed to fetch final room data.');
      }

      const jsonData = await dataResponse.json();

      // Step 4: Save data to localStorage and navigate
      localStorage.setItem('room', JSON.stringify(jsonData.room));
      jsonData.players.forEach((player: { userId: number; profilePicUrl: string; createdAt: string; id: number; name: string; score: number}) => {
        if(player.userId === user.id){ // Changed from == to === for strict equality
          player.profilePicUrl = user.profilePicUrl; // Changed from == to = for assignment
        }
      });
      localStorage.setItem('players', JSON.stringify(jsonData.players));
      localStorage.setItem('roomId', roomData.id.toString());
      router.push('/quiz/multiplayer/lobby');
    } catch (err: any) {
      console.error('Create/join error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return { createRoom, isLoading, error, setError };
};
