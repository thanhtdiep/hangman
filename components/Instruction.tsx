import {} from "types";
import { useState } from "react";
import GLOBALS from "@/global.json";

import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { motion, AnimatePresence } from "framer-motion";

const fadeVariant = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

export default function Instuction({}) {
  const [modal, setModal] = useState(true);
  return (
    <AnimatePresence>
      {modal && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeVariant}
            className="absolute top-0 left-0 bg-gray-900 bg-opacity-50 min-h-[100dvh] w-screen z-50"
          ></motion.div>
          {/* MODAL */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute w-1/2 h-1/2 z-50 bg-black p-4 border-2 border-white rounded "
          >
            <div className="relative flex flex-1 h-full flex-col items-center justify-center">
              {/* Instruction & Tips */}
              <Icon
                icon={faXmarkCircle}
                size="xl"
                className="absolute cursor-pointer right-2 top-4 text-white w-3 h-3 sm:w-4 sm:h-4"
                onClick={() => setModal(false)}
              />
              <h1 className="text-[1rem] sm:text-[2rem] mb-[2rem] md:mb-[3rem] lg:mb-[5rem]">
                Instructions
              </h1>
              <ul className="flex flex-1 flex-col space-y-4 justify-center h-full">
                {GLOBALS.INSTRUCTION.map((i, idx) => (
                  <li key={idx} className="">
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
