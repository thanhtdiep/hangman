import React, { FC } from "react";
import Player from "../components/Player";
import Lottie from "lottie-react";
import loadingAnimation from "../public/lottie/cubes.json";
import { ILobby, PlayerType, Size } from "../types";
// Ably
import { usePresence } from "@ably-labs/react-hooks";

// Props: Lobby, Loading
const Lobby: FC<ILobby> = ({
  lobby,
  lives,
  keyword,
  guesses,
  ready,
  name,
  mode,
  onChanges,
}) => {
  // Initial player state
  const newPlayer: PlayerType = {
    id: lobby.client_id!,
    name: name,
    lives: 8,
    is_host: lobby.host!,
    guesses: [],
    status: "",
    ready: false,
    keywords: keyword,
  };
  // const welcomeMsg = `${name} has joined the lobby.`
  // lobby presence
  const channelOpt = {
    channelName: lobby.code!,
  };
  // const [messages, setMessages] = React.useState([])
  const [presenceData, updateSelf] = usePresence(channelOpt, newPlayer);
  // receive data
  React.useEffect(() => {
    // Validation
    // TODO: Check player count > 4, callback onError
    // if (presenceData.length > 0) {
    //     console.log(presenceData)
    //     if (presenceData.length > 4) {
    //         const err = {
    //             type: 'lobby-full',
    //             description: 'Lobby is full! Please try again later.',
    //             className: 'bg-negative-red',
    //         }
    //         onError(err)
    //     }

    //     // IF lobby code is filled, but room don't have people, call on Error
    //     if (!create && presenceData.length < 2) {
    //         const err = {
    //             type: 'lobby-not-exist',
    //             description: 'Lobby does not exist. Please enter a different code.',
    //             className: 'bg-negative-red',
    //         }
    //         onError(err)
    //     }
    // }
    // Callbacks
    const playerList = presenceData.map((p) => p.data);
    onChanges(playerList);
  }, [presenceData]);

  // update data
  React.useEffect(() => {
    const newData: PlayerType = {
      id: lobby.client_id!,
      name: name,
      lives: lives,
      is_host: lobby.host!,
      guesses: guesses,
      status: lobby.status!,
      ready: ready,
      keywords: keyword,
    };
    updateSelf(newData);
  }, [lobby, guesses, lives, keyword]);

  return (
    <div
      className={`grid grid-row-1 mt-[1rem] ${
        mode == "lobby" ? "" : "h-[10rem]"
      } sm:h-[15rem]`}
    >
      {/* Show players in lobby */}
      {presenceData ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 md:grid-cols-4 justify-center">
          {presenceData.map((player, idx) => {
            const p = player.data;
            return (
              <Player
                key={idx}
                self={p.id == lobby.client_id}
                mode={mode}
                player={p}
                className=""
              />
            );
          })}
        </div>
      ) : (
        <div className="flex items-center">
          <Lottie
            animationData={loadingAnimation}
            loop={true}
            className="w-[7rem] bg-gray-00 rounded-full pointer-events-none"
          />
        </div>
      )}
    </div>
  );
};

export default Lobby;
