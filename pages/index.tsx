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

// TODO: Add framer animation, add check for duplicate old and new word
export default function Home() {
  const winSize: Size = useWindowSize();
  const [keywords, setKeywords] = React.useState<string[]>([])
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
        setStatus('success')
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
        setStatus('fail')
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
    fetchNewWord(GLOBALS.BASE_URL, (res: any, success: boolean) => {
      if (success) {
        const splitWord = res.word.toLowerCase().split('')
        setKeywords(splitWord)
      }
    })
    setGuesses([])
    setLives(8)
    setModal(false)
  }
  const handleTryAgain = () => {
    setGuesses([])
    setStatus('')
    setLives(8)
    setModal(false)
  }

  // monitor guesses
  React.useEffect(() => {
    // check if all keywords are guessed
    checkResult(guesses, keywords)
  }, [guesses])

  // monitor status
  React.useEffect(() => {
    if (status === 'win' || status === 'lose') {
      // show win message
      setModal(true)
    }
  }, [status])


  React.useEffect(() => {
    fetchNewWord(GLOBALS.BASE_URL, (res: any, success: boolean) => {
      if (success) {
        const data = res
        const splitWord = data.word.split('')
        setKeywords(splitWord)
      }
    })
  }, [])

  const modalStyles = {
    content: {
      top: '50%',
      left: '50%',
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
        <div className='flex flex-col lg:flex-row justify-center items-center mb-16 sm:mb-24'>
          <Man lives={lives} winSize={winSize} className='mr-0 lg:mr-16 mb-16 lg:mb-0' />
          <div className='flex flex-row lowercase text-white text-xl sm:text-[4rem] leading-5 tracking-[1rem] select-none'>
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
        <div className='flex flex-wrap'>
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
              {/* Win or Lose message */}
              {status === 'win' &&
                [
                  <h1 className='text-white text-center text-[2rem] mt-[2rem]'>You Win!</h1>,
                  <Lottie
                    animationData={winAnimation}
                    loop={false}
                    className='w-[6rem]'
                  />
                ]}
              {status === 'lose' &&
                [
                  < h1 className='text-white text-center text-[2rem] mt-[2rem]'>You Lose!</h1>,
                  <Lottie
                    animationData={loseAnimation}
                    loop={true}
                    className='w-[6rem]'
                  />
                ]}
              <button
                onClick={handleNewGame}
                className='text-white z-25 justify-center mt-[4rem] text-center p-2 rounded-lg border-2 border-white hover:bg-white hover:text-black w-[6rem]'>
                New Word
              </button>
              {status === 'lose' &&
                <button
                  onClick={handleTryAgain}
                  className='text-white z-25 mt-[1rem] text-center p-2 rounded-lg border-2 border-white hover:bg-white hover:text-black w-[6rem]'>
                  Try Again
                </button>
              }

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
