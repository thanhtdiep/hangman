import { IKeyword, Keyword } from "types";
import { useState, useEffect, FC } from "react";

import Key from "@/comps/Key";
import Button from "@/comps/Button";
import { motion } from "framer-motion";
import { useKeyword } from "@/hooks/use-keyword";
import { fadeVariant } from "@/animations";
import { checkGuess } from "@/helpers/utils";
import { BLANK_KEYWORD, KEYWORD } from "@/helpers/utils/data";

const Speaker = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
    />
  </svg>
);

const Keyword: FC<IKeyword> = ({
  guesses,
  hint,
  trigger,
  disabled = false,
  keyword,
  onNewKeyword,
}) => {
  const [tts, setTts] = useState<SpeechSynthesisUtterance>();
  const { data, isLoading, isRefetching, error, isRefetchError, refetch } =
    useKeyword({ disabled: disabled });

  // TODO: Add disabled props to stop query

  // functions
  const checkTts = (word: string) => {
    // Check if TTS is supported
    if ("speechSynthesis" in window) {
      var synthesis = window.speechSynthesis;
      var voice = synthesis.getVoices().filter(function (voice) {
        return voice.lang === "en";
      })[0];
      var utterance = new SpeechSynthesisUtterance(word);
      utterance.voice = voice;
      utterance.pitch = 1.5;
      utterance.rate = 1.25;
      // Set tts
      setTts(utterance);
    } else {
      console.log("Text-to-speech not supported.");
    }
  };

  // effects
  useEffect(() => {
    refetch();
  }, [trigger]);
  useEffect(() => {
    if (data) {
      const keywordObj: Keyword = {
        whole: data.word,
        split: data.word.toLowerCase().split(""),
      };
      onNewKeyword && onNewKeyword(keywordObj);

      // single
      if (hint) {
        checkTts(keywordObj.whole);
      }
    }
  }, [data]);

  //
  const hiddenWord = data ? data?.word.split("") : keyword?.split;

  // renders
  if (isLoading || isRefetching || !hiddenWord)
    return (
      <>
        <Key className="cursor-auto animate-bounce" title="?" />
      </>
    );
  if ((error || isRefetchError) && !disabled)
    return (
      <div className="flex flex-row justify-center items-center space-x-4">
        <h1>Something went wrong when trying to find a word.</h1>
        {!disabled && (
          <Button
            title="try again"
            className="w-[4rem] sm:w-[5rem] uppercase text-xs sm:text-sm"
            onClick={() => {
              refetch();
            }}
          />
        )}
      </div>
    );

  if (!hiddenWord)
    return (
      <div className="flex flex-row justify-center items-center space-x-4">
        <h1>Hmmm... Can't think of a word.</h1>
        {!disabled && (
          <Button
            title="try again"
            className="w-[4rem] sm:w-[5rem] uppercase text-xs sm:text-sm"
            onClick={() => {
              refetch();
            }}
          />
        )}
      </div>
    );
  return (
    <div
      className={`flex flex-row lowercase items-center text-white sm:text-[4rem] xs:text-[2rem] text-[1rem] leading-5 tracking-[1rem] select-none mb-10`}
    >
      <div className="flex flex-row flex-wrap leading-10">
        {hiddenWord.map((keyword: string, idx: number) => {
          const isGuessed = checkGuess(guesses, keyword);
          return (
            <div
              key={idx}
              className="flex flex-col justify-center items-center text-center w-[2rem] sm:w-[3rem]"
            >
              <div className="h-[1rem]">{isGuessed ? keyword : " "}</div>
              <div>_</div>
            </div>
          );
        })}
      </div>
      {tts && hint && (
        <div className="flex flex-col items-center">
          <motion.button
            initial="hidden"
            animate={hint && tts ? "visible" : "hidden"}
            variants={fadeVariant}
            className=" border-2 p-2 rounded-full hover:text-black hover:bg-white text-sm animate-bounce-stop"
            onClick={() => {
              window.speechSynthesis.speak(tts);
            }}
          >
            <Speaker />
          </motion.button>
        </div>
      )}
    </div>
  );
};
export default Keyword;
