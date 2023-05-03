import { IAlphabet } from "types";
import { FC } from "react";

import Key from "@/comps/Key";

import { motion } from "framer-motion";
import { slideVariant } from "@/animations";
import { checkGuess } from "@/helpers/utils";
import GLOBALS from "@/global.json";

const Alphabet: FC<IAlphabet> = ({ guesses, visible, loading, onClick }) => {
  // checkGuess logic
  // handlers
  const handleCheck = (key: string) => {
    const newGuesses = [...guesses, key];
    onClick(key, newGuesses);
  };
  return (
    <motion.div
      className="flex flex-wrap items-start justify-center"
      initial="hiddenDown"
      animate={visible ? "visible" : "hiddenDown"}
      variants={slideVariant}
    >
      {GLOBALS.ALPHABET.map((key, idx) => {
        const isGuessed = checkGuess(guesses, key);
        return (
          <Key
            key={idx}
            disabled={isGuessed || loading}
            title={key}
            onClick={() => handleCheck(key)}
          />
        );
      })}
    </motion.div>
  );
};

export default Alphabet;
