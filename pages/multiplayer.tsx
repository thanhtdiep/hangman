// Generic dependencies
import { useState, useEffect } from "react";
import Router, { useRouter } from "next/router";
import axios from "axios";
import styles from "@/styles/Home.module.css";
import { KEYWORD, BLANK_KEYWORD, LIVES, DEV } from "@/helpers/utils/data";
import {
  Keyword,
  Lobby,
  PostGame,
  MultiplayerPageProps,
  PlayerType,
  Error,
} from "@/types";

import KeywordComp from "@/comps/Keyword";
import Button from "@/comps/Button";
import Alphabet from "@/comps/Alphabet";
import Result from "@/comps/Result";
import Man from "@/comps/Man";

import { motion } from "framer-motion";
import { slideVariant } from "@/animations";
import { checkGuess, checkLives, checkWin } from "@/helpers/utils";
import { MAX_PLAYER } from "@/helpers/utils/data";
import GLOBALS from "@/global.json";

// Dependencies for PVP mode
import Alert from "../components/Alert";
import Tags from "../components/Tags";
import LobbyComp from "../components/Lobby";
import CodeBox from "../components/CodeBox";

import { v4 as uuid } from "uuid";
import { configureAbly } from "@ably-labs/react-hooks";

// Get props
export const getServerSideProps = (context: any) => {
  return {
    props: {
      name: context.query.name,
      code: context.query.code,
      host: context.query.host,
    },
  };
};
//
const Multiplayer = (props: MultiplayerPageProps) => {
  // variables
  const router = useRouter();
  const name: string = props.name;

  // states
  const [trigger, setTrigger] = useState(false);
  const [hint, setHint] = useState(false);
  const [keyword, setKeyword] = useState<Keyword>(
    DEV ? KEYWORD : BLANK_KEYWORD
  );
  const [guesses, setGuesses] = useState<string[]>([]);
  const [lives, setLives] = useState<number>(LIVES);
  const [loading, setLoading] = useState<boolean>(false);
  const [win, setWin] = useState<boolean>(false);

  // states for pvp mode
  const [ready, setReady] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [enable, setEnable] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
  const [mode, setMode] = useState<string>("lobby");
  const [postGame, setPostGame] = useState<PostGame>();
  const [lobby, setLobby] = useState<Lobby>({
    code: props.code,
    // WEIRD BUG: is_host boolean converted to string for some reasons. below is temp fix
    host: typeof props.host === "string" ? props.host === "true" : props.host,
    status: "in-lobby",
  });

  // funcitons
  const newKeyword = () => {
    setLoading(true);
    setTrigger(!trigger);
  };
  const socketInitializer = async () => {
    const randomUserId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    configureAbly({
      // authUrl: '/api/ably/auth',
      key: process.env.NEXT_PUBLIC_ABLY_APP_KEY,
      clientId: randomUserId,
    });
    setLobby((prev) => ({
      ...prev,
      client_id: randomUserId,
    }));
  };
  const isInGame = () => !win && lives > 0 && lobby.status === "in-game";
  const isGameEnd = () => win || !lives || lobby.status === "lose";
  const isInLobby = () => lobby.status === "in-lobby";

  // handles
  const handleNewKeyword = (keyword: Keyword) => {
    // fetch here
  };
  const handleCorrectGuess = (guess: string, guesses: string[]) => {
    // check guess
    // check lives
    const isCorrect = checkGuess(keyword.split, guess);
    const newLives = checkLives(isCorrect, lives);
    setLives(newLives);
    setGuesses(guesses);

    // check win conds
    if (newLives) {
      const isWon = checkWin(guesses, keyword.split);
      setWin(isWon);
      if (isWon) {
        setLobby((prev) => ({
          ...prev,
          status: "win",
        }));
        setPostGame({
          description: "Nice job! You've guessed the word first!",
        });
      }
    } else {
      setPostGame({
        description: "Nice try! Let's wait for the others",
      });
      setLobby((prev) => ({
        ...prev,
        status: "lose",
      }));
    }
  };

  // TODO: Need to optimize pvp logic
  const handleReady = (ready: boolean) => {
    setReady(ready);
    setLobby((prev) => ({
      ...prev,
      ready: ready,
    }));
  };
  const handleLeaveLobby = async () => {
    router.push("/");
  };

  const handleReturnLobby = async () => {
    // clear game state
    setLobby((prev) => ({
      ...prev,
      status: "in-lobby",
    }));
    setMode("lobby");
    setGuesses([]);
    setLives(8);
    setWin(false);
    setPostGame({});
  };
  const handleStartMultiple = async () => {
    try {
      const result = await axios.get(GLOBALS.WORD_ROUTE);
      const newKeyword: Keyword = {
        whole: result.data.word,
        split: result.data.word.toLowerCase().split(""),
      };
      setKeyword(newKeyword);
      // trigger game stat
      setLobby((prev) => ({
        ...prev,
        status: "in-game",
      }));
      setLoading(false);
      setMode("multiple");
      handleReady(false);
    } catch (err) {
      console.log("Error has occured");
      console.error(err);
    }
  };

  const handlePlayerMoves = (pList: PlayerType[]) => {
    if (pList.length < 1) return;
    let allReady = true;
    let gameOver = true;
    let noHost = true;
    pList.map((p) => {
      // handle start lobby
      if (
        p.is_host &&
        p.keywords &&
        p.status == "in-game" &&
        lobby.status == "in-lobby"
      ) {
        setKeyword(p.keywords);
        setMode("multiple");
        setLobby((prev) => ({ ...prev, status: "in-game" }));
        setReady(false);
      }

      // check winner
      if (p.id !== lobby.client_id && p.status == "win" && mode == "multiple") {
        // set Postgame
        setPostGame({
          winner: p,
        });
        setLobby((prev) => ({ ...prev, status: "lose" }));
        console.log("found winner");
      }

      // check game over
      if (p.lives > 0) {
        gameOver = false;
      }

      // check all ready
      if (!p.ready) {
        allReady = false;
      }

      // check host
      if (p.is_host) {
        noHost = false;
      }

      // TAGS
      let arr = [];
      const count = pList.length;
      arr.push(`${count}/${MAX_PLAYER}`);

      // not enough player
      if (pList.length < 2) {
        arr.push("Min player is 2");
      }
      setTags(arr);
    });

    // enable start game button
    setEnable(allReady && pList.length > 1 && pList.length < 5 ? true : false);
    // check game over
    if (lobby.status == "lose" && gameOver) {
      console.log("no one wins");
      // set postgame since no one wins
      setPostGame({
        description: "No one found the hidden word. Nice try tho!",
      });
    }

    // pass host to first person in lobby, if noone has lead
    if (noHost && pList[0].id == lobby.client_id) {
      setLobby((prev) => ({
        ...prev,
        host: true,
      }));
    }
  };

  // effects
  useEffect(() => {
    socketInitializer();
  }, []);

  return (
    <div className={styles.container}>
      <main className="flex flex-1 flex-col min-h-[80dvh] items-center justify-center">
        {/* IN LOBBY - Lobby, Tags, Ready/Start/Leave Opts*/}
        {lobby.client_id ? (
          <LobbyComp
            keyword={keyword}
            lives={lives}
            guesses={guesses}
            ready={ready} // might be redundant
            lobby={lobby}
            name={name}
            mode={mode}
            onChanges={handlePlayerMoves}
          />
        ) : (
          <div>Loadling...</div>
        )}
        {mode === "lobby" && (
          <>
            <Tags tags={tags} className="my-[2rem]" />
            <CodeBox
              code={lobby.code!}
              className="mt-2 transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-300"
              onClick={() => {
                if (lobby.code) navigator.clipboard.writeText(lobby.code);
                const alert: Error = {
                  description: "Copied",
                  className: "bg-positive-green",
                };
                setError(alert);
              }}
            />
            <div className="flex-1 flex flex-col">
              {lobby.status === "in-lobby" && lobby.host === true && (
                <Button
                  title="start"
                  disabled={!enable}
                  className={`w-[10rem] uppercase mb-2 ${
                    enable ? "" : "opacity-50"
                  }`}
                  onClick={handleStartMultiple}
                />
              )}
              <Button
                title={ready ? "unready" : "ready"}
                className="w-[10rem] uppercase mb-2"
                onClick={() => handleReady(!ready)}
              />
              <Button
                title="leave"
                className="w-[10rem] uppercase mb-2"
                onClick={handleLeaveLobby}
              />
            </div>
          </>
        )}

        {/* IN GAME - Lobby, Man, Keyword, Alphabet*/}
        {isGameEnd() && (
          <Result win={win} lives={lives} status={lobby.status} />
        )}
        {lobby.status === "in-game" && (
          <>
            {/* TODO: Check rendering conds */}
            {/* Man || Result */}
            <Man className="mb-10" lives={lives} />
            <KeywordComp
              guesses={guesses}
              hint={hint}
              trigger={trigger}
              disabled
              keyword={keyword}
              // onNewKeyword={handleNewKeyword}
            />
          </>
        )}

        {/* POSTGAME - Lobby, Result, Postgame Opts */}
        {/* Animations - Controls */}
        <div className="inline-block overflow-hidden">
          {/* Show post game options */}
          <motion.div
            className="flex flex-col sm:flex-row flex-1 justify-evenly items-center"
            initial="hiddenUp"
            animate={isGameEnd() ? "visible" : "hiddenUp"}
            variants={slideVariant}
          >
            {postGame && postGame?.winner ? (
              <div className="mb-2 sm:mb-0">
                <h2>{postGame.winner.name} has found the word </h2>
                <p>with {postGame.winner.guesses.length} tries!</p>
              </div>
            ) : (
              <div className="mb-2 sm:mb-0">{postGame?.description}</div>
            )}
            <Button
              title="return to lobby"
              className="w-[10rem] text-sm sm:text-base uppercase mb-2"
              onClick={handleReturnLobby}
            />
            <Button
              title="quit"
              className="w-[10rem] text-sm sm:text-base uppercase mb-2"
              onClick={handleLeaveLobby}
            />
          </motion.div>
          {/* IN-GAME */}
          <Alphabet
            guesses={guesses}
            loading={loading}
            visible={isInGame()}
            onClick={handleCorrectGuess}
          />
        </div>

        {/* ERROR BOX */}
        <div className="absolute bottom-4 h-[4rem]">
          {error && <Alert error={error} className="mb-2" />}
        </div>
      </main>
    </div>
  );
};

export default Multiplayer;
