import Head from "next/head";
import Key from "./Key";

const Header = () => {
  return (
    <>
      <Head>
        <title>Hangman</title>
        <meta name="description" content="Guess the word!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* LOGO */}
      <header className="mt-[1rem] flex flex-row items-center justify-center select-none cursor-default">
        {/* Logo components */}
        {"hangman".split("").map((w, idx) => (
          <Key key={idx} logo title={w} />
        ))}
      </header>
    </>
  );
};

export default Header;
