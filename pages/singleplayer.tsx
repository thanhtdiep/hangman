// Generic dependencies
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Home.module.css";
import { KEYWORD, BLANK_KEYWORD, LIVES, DEV } from "@/helpers/utils/data";
import { Keyword } from "@/types";

import KeywordComp from "@/comps/Keyword";
import Button from "@/comps/Button";
import Alphabet from "@/comps/Alphabet";
import Result from "@/comps/Result";
import Man from "@/comps/Man";

import { motion } from "framer-motion";
import { slideVariant } from "@/animations";
import { checkGuess, checkLives, checkWin } from "@/helpers/utils";
import withTransition from "@/animations/HOC/withTransition";

const Singleplayer = () => {
  const router = useRouter();
  const [trigger, setTrigger] = useState(false);
  const [hint, setHint] = useState(false);
  const [keyword, setKeyword] = useState<Keyword>(
    DEV ? KEYWORD : BLANK_KEYWORD
  );
  const [guesses, setGuesses] = useState<string[]>([]);
  const [lives, setLives] = useState<number>(LIVES);
  const [loading, setLoading] = useState<boolean>(true);
  const [win, setWin] = useState<boolean>(false);
  // funcitons
  const newKeyword = () => {
    setLoading(true);
    setTrigger(!trigger);
  };
  // handles
  const handleNewKeyword = (keyword: Keyword) => {
    setKeyword(keyword);
    setLoading(false);
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
      setWin(checkWin(guesses, keyword.split));
    }
  };
  const handleNewGame = () => {
    newKeyword();
    setHint(false);
    setWin(false);
    setGuesses([]);
    setLives(LIVES);
  };
  const handleTryAgain = () => {
    //  show hint
    setHint(true);
    setLives(LIVES);
  };
  const handleBack = () => {
    router.push({
      pathname: "/",
    });
  };
  return (
    <div className={styles.container}>
      <main className="relative flex flex-1 flex-col min-h-[80dvh] items-center justify-center">
        <Button
          title="back"
          className="absolute left-2 top-0 w-[10rem] uppercase mb-2"
          onClick={handleBack}
        />
        {!win && lives ? (
          <Man className="mb-10" lives={lives} />
        ) : (
          <Result win={win} lives={lives} />
        )}
        <KeywordComp
          guesses={guesses}
          hint={hint}
          trigger={trigger}
          onNewKeyword={handleNewKeyword}
        />

        {/* Animations */}
        <div className="inline-block overflow-hidden">
          {/* Show post game options */}
          <motion.div
            className="flex flex-row flex-1 justify-evenly items-center"
            initial="hiddenUp"
            animate={win || !lives ? "visible" : "hiddenUp"}
            variants={slideVariant}
          >
            <button
              onClick={handleNewGame}
              className="text-white text-center p-2 mb-2 sm:mb-0 rounded-lg border-2 border-white hover:bg-white hover:text-black w-[10rem]"
            >
              New Word
            </button>
            {
              !lives ? (
                <button
                  onClick={handleTryAgain}
                  className="text-white text-center p-2 rounded-lg border-2 border-white hover:bg-white hover:text-black w-[10rem]"
                >
                  Try Again
                </button>
              ) : (
                <div className="w-[10rem]"></div>
              ) // force render empty div
            }
          </motion.div>
          <Alphabet
            guesses={guesses}
            loading={loading}
            visible={!win && lives > 0}
            onClick={handleCorrectGuess}
          />
        </div>
      </main>
    </div>
  );
};

export default withTransition(Singleplayer);
