import { Player } from "@/utils/types";
import Cookies from "js-cookie";

export const parseLocalStorage = (key: string) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const parseUserCookie = () => {
  try {
    const cookie = Cookies.get("user");
    const jsonMatch = cookie?.match(/\{.*\}/);
    if (!jsonMatch) return null;
    const data = JSON.parse(decodeURIComponent(jsonMatch[0]));
    return {
      id: data.id.toString(),
      name: data.name,
      profilePicUrl: data.profilePicUrl || "",
    };
  } catch {
    return null;
  }
};

export const normalizePlayers = (players: any[]) =>
  players.map((p) => ({
    userId: p.userId.toString(),
    name: p.name,
    profilePicUrl: p.profilePicUrl || "",
    score: p.score,
  }));

export const enrichPlayers = async (
  players: Player[],
  failedSet: Set<string>
): Promise<Player[]> => {
  return Promise.all(
    players.map(async (player) => {
      if (player.profilePicUrl?.trim()) return player;

      try {
        const res = await fetch(`http://localhost:8082/auth/user/profile/pic/${player.userId}`);
        if (!res.ok) throw new Error("Failed fetch");

        const data = await res.json();
        const url = data?.profilePicUrl?.trim() || "";
        return { ...player, profilePicUrl: url };
      } catch (e) {
        console.warn(`Failed to fetch pic for ${player.userId}:`, e);
        failedSet.add(`${player.userId}`); // ✅ Mark as failed
        return { ...player, profilePicUrl: "" };
      }
    })
  );
};


export const fetchRoomFromServer = async (id: string | number, userId: string) => {
  const res = await fetch(`http://localhost:8083/api/rooms/${id}/${userId}`);
  if (!res.ok) throw new Error("Room fetch failed");
  const data = await res.json();
  return {
    room: data.room,
    players: normalizePlayers(data.players),
  };
};
