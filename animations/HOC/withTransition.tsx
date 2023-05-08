import { motion } from "framer-motion";
import React from "react";
import { AnimatePresence } from "framer-motion";
const withTransition = (Component: React.ComponentType) => {
  return () => (
    <>
      <Component />
      <motion.div
        key="slide-in"
        className="slide-in bg-gray-900"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 0 }}
        exit={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      <motion.div
        key="slide-out"
        className="slide-out bg-gray-900"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        exit={{ scaleX: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </>
  );
};

export default withTransition;
