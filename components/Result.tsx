import { FC } from "react";

import Lottie from "lottie-react";
import winAnimation from "../public/lottie/hangman-win.json";
import loseAnimation from "../public/lottie/hangman-lose.json";
import confettiAnimation from "../public/lottie/confetti.json";

import { ResultProps } from "@/types";

const Result: FC<ResultProps> = ({ win, lives, status }) => {
  return (
    <div className="relative flex flex-col items-center">
      {win && (
        <Lottie
          animationData={confettiAnimation}
          loop={false}
          className="absolute bottom-0 z-30 w-full pointer-events-none"
        />
      )}
      <div className="flex flex-col items-center justify-center mb-2 sm:mb-16 lg:mb-0 w-[250px] lg:w-[150px] h-[250px] lg:h-[150px]">
        {win && (
          <>
            <h1 className="text-white text-center text-[2rem] mb-4 capitalize">
              nice job!
            </h1>
            <Lottie
              animationData={winAnimation}
              loop={false}
              className="w-[10rem]"
            />
          </>
        )}
        {!lives || status === "lose" ? (
          <>
            <h1 className="text-white text-center text-[2rem] mb-4 capitalize">
              nice try!
            </h1>
            <Lottie
              animationData={loseAnimation}
              loop={true}
              className="w-[10rem]"
            />
          </>
        ) : null}
      </div>
    </div>
  );
};
export default Result;
