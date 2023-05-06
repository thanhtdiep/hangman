export const checkGuess = (guesses: string[], newGuess: string) => {
  if (guesses.length == 0) return false;
  return guesses.some((k: string) => {
    return k.toLowerCase() === newGuess.toLowerCase();
  });
};

export const checkLives = (correctGuess: boolean, lives: number) => {
  if (correctGuess) return lives;
  const newLives = lives - 1;
  return newLives < 0 ? 0 : newLives;
};

export const checkWin = (guesses: string[], keywords: string[]) => {
  let count = 0;
  keywords.some((k: string) => {
    const isGuessed = checkGuess(guesses, k); // can use array Every method to reduce loops
    if (isGuessed) count++;
  });
  // don't have to worry about this cause in live, it will be overlap when fetch
  if (count === keywords.length && keywords.length > 0) {
    return true;
  }
  return false;
};
