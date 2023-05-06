import React, { FC } from "react";
import { Lobby, ButtonProps } from "types";
import styles from "../styles/Home.module.css";
import { v4 as uuid } from "uuid";

// new imports
import Instuction from "@/components/Instruction";
import Button from "@/components/Button";
import { useRouter } from "next/router";

// TODO: Add framer animation, add check for duplicate old and new word
export default function Home() {
  const [name, setName] = React.useState<string>("");
  const [lobby, setLobby] = React.useState<Lobby>({
    code: "",
  });
  // router
  const router = useRouter();

  const handleLobbyInput = (e: React.FormEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    setLobby((prev) => ({
      ...prev,
      code: newValue,
    }));
  };
  // NEW FUNCTIONs
  const handleSingle = () => {
    router.push({
      pathname: "/singleplayer",
    });
  };
  const handleMultiplayer = (isCreate: boolean) => {
    if (!name || (!isCreate && !lobby.code)) return;

    const newRoomId = !isCreate ? lobby.code : uuid().slice(0, 8);
    router.push(
      {
        pathname: "/multiplayer",
        query: {
          name: name,
          code: newRoomId,
          host: isCreate,
        },
      },
      "/multiplayer"
    );
  };

  // NEW CODE
  return (
    <div className={styles.container}>
      <main className="flex flex-1 flex-col min-h-[80dvh] items-center justify-end">
        <div className="absolute bottom-20">
          {/* Start single player */}
          <div className="flex flex-col mb-2">
            <h1 className="uppercase border-b-2 border-white mb-2">
              single player
            </h1>
            <Button
              title="start"
              className="w-[10rem] uppercase mb-2"
              onClick={handleSingle}
            />
          </div>
          {/* Create a multiplayer lobby */}
          <div className="flex flex-col">
            <h1 className="uppercase border-b-2 border-white mb-2">
              multiplayer
            </h1>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="py-[5px] pl-[7px] text-black rounded-md text-sm sm:text-base w-[10rem] h-10 mb-2"
              placeholder="Name"
              required
            />
            <input
              id="lobby"
              type="text"
              value={lobby?.code}
              onChange={handleLobbyInput}
              className="py-[5px] pl-[7px] text-black rounded-md text-sm sm:text-base w-[10rem] h-10 mb-2"
              placeholder="Lobby Code"
              required
            />
            <Button
              disabled={name ? false : true}
              title="create a game"
              className="disabled:opacity-50 w-[10rem] uppercase mb-2"
              onClick={() => handleMultiplayer(true)}
            />
            {/*  Join a multiplayer lobby */}
            <Button
              disabled={name && lobby.code ? false : true}
              title="join a game"
              className="disabled:opacity-50 w-[10rem] uppercase"
              onClick={() => handleMultiplayer(false)}
            />
          </div>
        </div>
        <Instuction />
      </main>
    </div>
  );
}
