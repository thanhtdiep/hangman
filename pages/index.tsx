import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import GLOBALS from '../global.json';
import axios from 'axios';
import React from 'react';
import Key from '../components/Key'
import Man from '../components/Man'
import Modal from 'react-modal'
import Lottie from "lottie-react";
import { motion } from 'framer-motion'
import { useWindowSize } from '../helpers/useWindowSize'
import winAnimation from '../public/lottie/hangman-win.json'
import loseAnimation from '../public/lottie/hangman-lose.json'
import confettiAnimation from '../public/lottie/confetti.json'

interface Size {
  width: number,
  height: number
}
const slideVairant = {
  hiddenDown: {
    y: '200%',
  },
  hiddenUp: {
    y: '-200%',
  },
  visible: {
    y: 0,
    transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 1 }
  }
}

const KEYWORD = ['d', 'e', 'v']
const DEV = false
// TODO: Add framer animation, add check for duplicate old and new word
export default function Home() {
  const winSize: Size = useWindowSize();
  const [keywords, setKeywords] = React.useState<string[]>(DEV ? KEYWORD : [])
  const [status, setStatus] = React.useState<string>('')
  const [guesses, setGuesses] = React.useState<string[]>([])
  const [lives, setLives] = React.useState<number>(8)
  const [modal, setModal] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string>('')
  Modal.setAppElement('#modals')

  const fetchNewWord = async (url: string, cb: any) => {
    setStatus('loading')
    await axios.get(url, {
      headers: {
        'X-Api-Key': process.env.NINJA_APIKEY
      }
    })
      .then((res) => {
        setStatus('')
        cb(res.data, true)
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
          setError("Failed to get new word. Please try again later!")
        } else if (err.request) {
          console.log(err.request);
          setError("Failed to get new word. Please try again later!")
        } else {
          console.log('Error', err.message)
          setError(err.message)
        }
        console.log(err.config)
        setStatus('')
        cb('', false)
      })
  }


  const checkGuess = (guesses: string[], newGuess: string, method: string = 'some') => {
    if (guesses.length == 0) return false;
    return guesses.some((k: string) => {
      return k.toLowerCase() === newGuess.toLowerCase()
    })
  }

  const checkResult = (guesses: string[], keywords: string[]) => {
    let count = 0;
    keywords.some((k: string) => {
      const isGuessed = checkGuess(guesses, k) // can use array Every method to reduce loops
      if (isGuessed) count++
    })
    // don't have to worry about this cause in live, it will be overlap when fetch
    if (count === keywords.length && keywords.length > 0) {
      setStatus('win')
    }
  }

  const checkLives = (result: boolean, lives: number) => {
    if (result) return;
    const newLives = lives - 1
    if (newLives <= 0) setStatus('lose')
    setLives(prev => (prev - 1))
  }

  const handleNewGame = () => {
    if (!DEV) {
      fetchNewWord(GLOBALS.BASE_URL, (res: any, success: boolean) => {
        if (success) {
          const splitWord = res.word.toLowerCase().split('')
          setKeywords(splitWord)
        }
      })
    } else {
      setStatus('')
      setKeywords([])
      setKeywords(KEYWORD)
    }
    setGuesses([])
    setLives(8)
  }
  const handleTryAgain = () => {
    //  show hint
    setStatus('')
    setLives(8)
  }

  // monitor guesses
  React.useEffect(() => {
    // check if all keywords are guessed
    // TODO: IMPROVEMENT - Move this code directly to where setGuesses is performed
    checkResult(guesses, keywords)
  }, [guesses])

  // monitor status
  React.useEffect(() => {
    // if (status === 'win' || status === 'lose') {
    //   // show win message
    //   setModal(true)
    // }
  }, [status])


  React.useEffect(() => {
    if (!DEV) {
      fetchNewWord(GLOBALS.BASE_URL, (res: any, success: boolean) => {
        if (success) {
          const data = res
          const splitWord = data.word.split('')
          setKeywords(splitWord)
        }
      })
    }
    // show instructions
    setModal(true)
  }, [])

  const modalStyles = {
    content: {
      top: '50%',
      left: '50%',
      marginRight: winSize.width < 768 ? '-45%' : '',
      marginBottom: winSize.width < 768 ? '-10%' : '0%',
      transform: 'translate(-50%, -50%)',
      background: 'black'
    },
    overlay: {
      background: "#FF00",
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Hangman</title>
        <meta name="description" content="Guess the word!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='flex flex-1 flex-col min-h-screen justify-center items-center'>
        {status === 'win' &&
          <Lottie
            animationData={confettiAnimation}
            loop={false}
            className='absolute bottom-0 z-30 w-full pointer-events-none'
          />}
        <div className='flex w-full flex-col lg:flex-row justify-evenly items-center mb-16 sm:mb-24 '>
          {/* Win or Lose message */}
          <div className='flex flex-col items-center justify-center mb-16 lg:mb-0 w-[250px] lg:w-[150px] h-[250px] lg:h-[150px] '>
            {status === 'win' &&
              <>
                <h1 className='text-white text-center text-[2rem] mb-4'>Nice Job!</h1>,
                <Lottie
                  animationData={winAnimation}
                  loop={false}
                  className='w-[10rem]'
                />
              </>
            }
            {status === 'lose' &&
              <>
                < h1 className='text-white text-center text-[2rem] mb-4'>Nice Try!</h1>,
                <Lottie
                  animationData={loseAnimation}
                  loop={true}
                  className='w-[10rem]'
                />
              </>

            }
            {/* Lives */}
            {status === '' &&
              <Man lives={lives} winSize={winSize} className='' />
            }

          </div>
          {/* Keyword */}
          <div className='flex flex-row lowercase text-white text-[2rem] sm:text-[4rem] leading-5 tracking-[1rem] select-none'>
            {status !== 'loading' ? keywords?.map((keyword, idx) => {
              const isGuessed = checkGuess(guesses, keyword)
              return (
                <div key={idx}>
                  {isGuessed ? keyword : '_'}
                </div>
              )
            }) :
              <>
                {'?'.split('').map((w, idx) => (
                  <Key
                    key={idx}
                    className='animate-bounce cursor-auto'
                    title={w}
                  />
                ))}
              </>
            }
          </div>
        </div>
        {/* ALPHABET */}
        <div className='inline-block overflow-hidden'>
          <motion.div
            className='flex flex-row justify-evenly '
            initial='hidden'
            animate={status === 'win' || status === 'lose' ? 'visible' : "hiddenUp"}
            variants={slideVairant}
          >
            <button
              onClick={handleNewGame}
              className='text-white justify-center text-center p-2 rounded-lg border-2 border-white hover:bg-white hover:text-black w-[6rem]'>
              New Word
            </button>
            {status === 'lose' &&
              <button
                onClick={handleTryAgain}
                className='text-white  text-center p-2 rounded-lg border-2 border-white hover:bg-white hover:text-black w-[6rem]'>
                Try Again
              </button>
            }
          </motion.div>
          <motion.div
            className='flex flex-wrap'
            initial='visible'
            animate={!status ? 'visible' : "hiddenDown"}
            variants={slideVairant}
          >
            {GLOBALS.ALPHABET.map((key, idx) => {
              const isGuessed = checkGuess(guesses, key)
              return (
                <Key key={idx}
                  disabled={isGuessed || status === 'loading'}
                  className={` ${status == 'lose' && 'cursor-default'}`}
                  title={key}
                  onClick={() => {
                    if (status == 'lose') return;
                    const isCorrect = checkGuess(keywords, key)
                    checkLives(isCorrect, lives)
                    setGuesses(prev => ([...prev, key]))
                  }} />
              )
            })}
          </motion.div>
        </div>
        {error &&
          <div className='flex flex-col'>
            Error: {error}
          </div>
        }
        <div id='modals'>
          <Modal
            isOpen={modal}
            ariaHideApp={false}
            style={modalStyles}
            contentLabel="Result Modal">
            <div className='flex flex-col items-center justify-center'>
              {/* Instruction & Tips */}
              <button
                onClick={() => setModal(false)}
                className='mb-2 sm:mb-0 sm:absolute sm:top-8 sm:right-8 text-white bg-black hover:bg-white hover:text-black rounded-lg border-2 px-2 pb-1'>
                x
              </button>
              <h1 className='text-[1rem] sm:text-[2rem] mb-[2rem] md:mb-[3rem] lg:mb-[5rem]'>Instructions</h1>
              <ul className='list-disc px-2'>
                {GLOBALS.INSTRUCTION.map((i, idx) => (
                  <li key={idx} className='mb-2'>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          </Modal>
        </div>

      </main >

      <footer className={styles.footer}>
        <a
          href="https://thanhdiep.vercel.app/"
          className='text-sm'
          target="_blank"
          rel="noopener noreferrer"

        >
          by
          <span className='mx-2'>
            <Image src="/logo32.png" alt="Logo" width={24} height={24} />
          </span>
        </a>
      </footer>
    </div >
  )
}
