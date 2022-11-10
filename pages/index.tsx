import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import GLOBALS from '../global.json';
import axios from 'axios';
import React from 'react';
import Key from '../components/Key'
interface Character {

}

export default function Home() {
  const [keywords, setKeywords] = React.useState<string[]>([])
  const [status, setStatus] = React.useState<string>()
  const [guesses, setGuesses] = React.useState<string[]>([])
  const count = React.useRef<number>(0)
  React.useEffect(() => {
    // axios.get(GLOBALS.BASE_URL, {
    //   headers: {
    //     'X-Api-Key': process.env.NINJA_APIKEY
    //   }
    // })
    //   .then((res) => {
    //     setKeyword(res.data.word)
    //     console.log(res.data)
    //   })
    // REMOVE this when fetching actual word
    const word = 'keyword'
    const splitWord = word.split('')
    setKeywords(splitWord)
  }, [])

  const checkGuess = (guesses: string[], newGuess: string, method: string = 'some' ) => {
    if (guesses.length == 0) return false;
    return guesses.some((k: string) => {
      return k.toLowerCase() === newGuess.toLowerCase()
    })
  }

  const checkSuccess = (guesses: string[], keywords: string[] ) => {
    let count = 0;
    keywords.some((k: string) => {
      const isGuessed = checkGuess(guesses, k) // can use array Every method to reduce loops
      if (isGuessed) count++
    })
    if (count == keywords.length) setStatus('success')
  }

  const newGame = () => {
    // get new word
    setGuesses([])
  }

  React.useEffect(() => {
    // check if all keywords are guessed
    checkSuccess(guesses, keywords)
  }, [guesses])

  return (
    <div className={styles.container}>
      <Head>
        <title>Hangman</title>
        <meta name="description" content="Guess the word!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='flex flex-1 flex-col min-h-screen justify-center items-center'>
        <div className='flex flex-row text-[4rem] leading-5 tracking-[2rem] mb-32 select-none'>
          {keywords?.map((keyword, idx) => {
            const isGuessed = checkGuess(guesses, keyword)
            return (
              <div key={idx}>
                {isGuessed ? keyword : '_'}
              </div>
            )
          })}
        </div>
        <div className='flex flex-wrap'>
          {GLOBALS.ALPHABET.map((key, idx) => {
            const isGuessed = checkGuess(guesses, key)
            return (
              <Key key={idx} disabled={isGuessed} className='flex disabled:cursor-default disabled:opacity-50 uppercase mr-2 mb-2 rounded-md justify-center items-center cursor-pointer w-6 border-2 border-white' title={key} onClick={() => setGuesses(prev => ([...prev, key]))} />
            )
          })}
        </div>
        <div>
          Result: {status}
        </div>

      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}
