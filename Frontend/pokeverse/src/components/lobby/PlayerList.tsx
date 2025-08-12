import Image from "next/image";
import React from "react";
import { Player, Room } from "@/utils/types"
import PokeButton from "../PokemonButton";

const padded = (n?: number) => (n !== undefined ? n.toString().padStart(2, "0") : "00");

interface PlayerListProps {
  players: Player[];
  room: Room | null;
  userId: string;
  onStartGame: () => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, room, userId, onStartGame }) => (
  <div className="bg-[#1e1e1e] px-10 py-8 rounded-3xl shadow-lg w-[400px] flex flex-col items-center gap-6 tracking-widest">
    <div className="text-2xl font-bold">Waiting Lobby</div>
    <div className="text-sm w-full text-right">
      {`${padded(players.length)}/${padded(room?.maxPlayers)}`}
    </div>
    <div className="text-lg">Players</div>
    <div className="w-full flex flex-col gap-4 p-6 rounded-3xl bg-[#111111] max-h-[70vh] overflow-y-auto">
      {players.map((player) => (
        <div key={player.userId} className="flex items-center gap-4 bg-[#2e2e2e] px-4 py-2 rounded-3xl">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={
                player.profilePicUrl?.trim()
                  ? player.profilePicUrl
                  : "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
              }
              alt="Profile"
              width={32}
              height={32}
            />
          </div>
          <div>{player.name}</div>
        </div>
      ))}
    </div>
    {room?.hostId?.toString() === userId ? (
      <PokeButton buttonName="Start" onClick={onStartGame}/>
    ) : (
      <p className="text-sm text-gray-400">Waiting for host to start...</p>
    )}
  </div>
);

export default PlayerList;
