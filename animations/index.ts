export const fadeVariant = {
  hidden: {
    opacity: 0,
    transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 1 },
  },
  visible: {
    opacity: 1,
    transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 1 },
  },
};

export const slideVariant = {
  hiddenDown: {
    y: "200%",
    transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 1 },
  },
  hiddenUp: {
    y: "-200%",
    transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 1 },
  },
  visible: {
    y: 0,
    transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 1 },
  },
};
