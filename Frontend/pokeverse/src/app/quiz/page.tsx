"use client";
import PikachuLoader from "@/components/pikachuLoader";
import PokeButton from "@/components/PokemonButton";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import Cookies from "js-cookie";

export default function Quiz() {
  const router = useRouter();
  const [loader, setLoader] = useState(false);

  const inputcss =
    "bg-[#2e2e2e] h-[45px] w-[180px] rounded-4xl flex justify-center items-center m-[10px] shadow";

  // Refs to access form values
  const difficultyRef = useRef<HTMLSelectElement>(null);
  const regionRef = useRef<HTMLSelectElement>(null);
  const roundsRef = useRef<HTMLSelectElement>(null);

  const handleMultiplayerCreate = useCallback(() => {
    setLoader(true);
    router.push("quiz/multiplayer/create");
  }, [router]);

  const handleMultiplayerJoin = useCallback(() => {
    setLoader(true);
    router.push("quiz/multiplayer/join");
  }, [router]);

const handleSinglePlayer = useCallback(async () => {
  const userCookie = Cookies.get("user");
  if (!userCookie) {
    alert("User not logged in.");
    return;
  }

  const user = JSON.parse(userCookie);

  const difficulty = difficultyRef.current?.value;
  const region = regionRef.current?.value;
  const rounds = roundsRef.current?.value;

  // ❗ Validate all fields are selected
  if (
    !difficulty ||
    difficulty === "none" ||
    !region ||
    region === "none" ||
    !rounds ||
    rounds === "none"
  ) {
    alert("Please select all fields before starting the quiz.");
    return;
  }

  const totalQuestions = parseInt(rounds);

  const body = {
    userId: user.id,
    difficulty,
    region,
    quizType: "all",
    totalQuestions,
    startTime: new Date().toISOString(),
  };

  setLoader(true);

  try {
    const res = await fetch("http://localhost:8083/api/sessions/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("Failed to create session");

    const data = await res.json();

    localStorage.setItem("session", JSON.stringify(data.session));
    localStorage.setItem("quizQuestions", JSON.stringify(data.quizzes));

    router.push(`/quiz/singleplayer/question`);
  } catch (err) {
    console.error("Session creation failed:", err);
    alert("Something went wrong while starting the quiz.");
    setLoader(false);
  }
}, [router]);

  return (
    <div className="h-full flex flex-col justify-center items-center gap-[50px]">
      {loader && <PikachuLoader />}
      <div className="text-5xl font-bold font-[Piedra]">PokeQuiz</div>

      <div className="flex flex-row items-center gap-[100px]">
        {/* Single Player Card */}
        <div className="bg-[#1e1e1e] h-[400px] w-[300px] border-0 rounded-[40px] flex flex-col justify-evenly items-center">
          <div className="text-3xl h-[45px] w-[210px] rounded-4xl flex justify-center items-center m-[10px] font-[Piedra]">
            Single Player
          </div>

          {/* Form */}
          <form
            className="flex flex-col items-center font-[Mogra]"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className={inputcss}>
              <select
                ref={difficultyRef}
                defaultValue="none"
                className="bg-[#2e2e2e] text-white border-none outline-none w-[100px] m-0"
              >
                <option value="none" disabled>
                  Difficulty
                </option>
                <option value="all">All</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className={inputcss}>
              <select
                ref={regionRef}
                defaultValue="none"
                className="bg-[#2e2e2e] text-white border-none outline-none w-[100px] m-0"
              >
                <option value="none" disabled>
                  Region
                </option>
                <option value="all">All</option>
                <option value="kanto">Kanto</option>
                <option value="johto">Johto</option>
                <option value="hoenn">Hoenn</option>
                <option value="sinnoh">Sinnoh</option>
                <option value="unova">Unova</option>
                <option value="kalos">Kalos</option>
                <option value="alola">Alola</option>
                <option value="galar">Galar</option>
                <option value="paldea">Paldea</option>
              </select>
            </div>

            <div className={inputcss}>
              <select
                ref={roundsRef}
                defaultValue="none"
                className="bg-[#2e2e2e] text-white border-none outline-none w-[100px] m-0"
              >
                <option value="none" disabled>
                  Rounds
                </option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
              </select>
            </div>

            <div className="mt-2">
              <PokeButton buttonName="Start" onClick={handleSinglePlayer} />
            </div>
          </form>
        </div>

        {/* Multiplayer Card */}
        <div className="bg-[#1e1e1e] h-[400px] w-[300px] border-0 rounded-[40px] flex flex-col justify-evenly items-center">
          <div className="text-3xl h-[45px] w-[270px] rounded-4xl flex justify-center items-center m-[10px] font-[Piedra] relative bottom-[35px]">
            Play With Friends
          </div>
          <div className="flex flex-col justify-evenly items-center relative bottom-[40px]">
            <button
              className={inputcss + " font-[Mogra]"}
              onClick={handleMultiplayerCreate}
            >
              Create
            </button>
            <button
              className={inputcss + " font-[Mogra]"}
              onClick={handleMultiplayerJoin}
            >
              Join
            </button>
          </div>
        </div>
      </div>
     
    </div>
  );
}
