import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import GLOBALS from '../global.json';
import axios from 'axios';
import React, { FC } from 'react';
import Key from '../components/Key';
import Man from '../components/Man';
import Player from '../components/Player';
import Modal from 'react-modal';
import Lottie from "lottie-react";
import { motion } from 'framer-motion';
import { useWindowSize } from '../helpers/useWindowSize';
import io from 'Socket.IO-client'
import { v4 as uuid } from 'uuid';
import winAnimation from '../public/lottie/hangman-win.json';
import loseAnimation from '../public/lottie/hangman-lose.json';
import confettiAnimation from '../public/lottie/confetti.json';
import { start } from 'repl';

let socket: any;

interface Size {
  width: number,
  height: number
}
interface PlayerType {
  id: number,
  name: string,
  lives: number,
  guesses: string[]
}

interface Lobby {
  host?: boolean,
  client_id?: string,
  code?: string,
  players?: PlayerType[]
}
interface Keyword {
  whole: string,
  split: string[]
}

interface ButtonProps {
  title: string,
  className: string,
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void

}
const slideVairant = {
  hiddenDown: {
    y: '200%',
    transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 1 }
  },
  hiddenUp: {
    y: '-200%',
    transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 1 }
  },
  visible: {
    y: 0,
    transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 1 }
  }
}

const fadeVariant = {
  hidden: {
    opacity: 0,
    transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 1 }
  },
  visible: {
    opacity: 1,
    transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 1 }
  }
}

const KEYWORD = {
  whole: 'dev',
  split: ['d', 'e', 'v']
}
const BLANK_KEYWORD = {
  whole: '',
  split: []
}
const DEV = false
// TODO: Add framer animation, add check for duplicate old and new word
export default function Home() {
  const winSize: Size = useWindowSize();
  const [keywords, setKeywords] = React.useState<Keyword>(DEV ? KEYWORD : BLANK_KEYWORD)
  const [status, setStatus] = React.useState<string>('')
  const [name, setName] = React.useState<string>('')
  const [lobby, setLobby] = React.useState<Lobby>({
    code: ''
  })
  const [mode, setMode] = React.useState<string>('intro')
  const [guesses, setGuesses] = React.useState<string[]>([])
  const [lives, setLives] = React.useState<number>(8)
  const [modal, setModal] = React.useState<boolean>(false)
  const [hint, setHint] = React.useState<boolean>(DEV)
  const [tts, SetTts] = React.useState<SpeechSynthesisUtterance>()
  const [error, setError] = React.useState<string>('')

  Modal.setAppElement('#modals')

  const fetchNewWord = async (url: string, cb: any) => {
    setStatus('loading')
    await axios.get(url)
      .then((res) => {
        setStatus('')
        cb(res.data, true)
      })
      .catch((err) => {
        if (err.message) {
          console.log(err.message)
          setError(err.message)
        }
        if (err.error) {
          console.log(err.error)
        }
        console.log(err)
        console.log('Error has occured')
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
    if (newLives <= 0) {
      setStatus('lose')
      setHint(true)
    }
    setLives(prev => (prev - 1))
  }

  // FOR SINGLEPLAYER
  const checkTts = (word: string) => {
    // Check if TTS is supported
    if ("speechSynthesis" in window) {
      var synthesis = window.speechSynthesis;
      var voice = synthesis.getVoices().filter(function (voice) {
        return voice.lang === 'en';
      })[0];
      var utterance = new SpeechSynthesisUtterance(word);
      utterance.voice = voice;
      utterance.pitch = 1.5;
      utterance.rate = 1.25;
      // Set tts
      SetTts(utterance)
    } else {
      console.log('Text-to-speech not supported.')
    }
  }

  // FOR SINGLEPLAYER
  const handleNewGame = () => {
    if (!DEV) {
      fetchNewWord(GLOBALS.WORD_ROUTE, (res: any, success: boolean) => {
        if (success) {
          var word = res.word
          const splitWord = res.word.toLowerCase().split('')
          setKeywords({
            whole: word,
            split: splitWord
          })
          checkTts(word)
        }
      })
    } else {
      setStatus('')
      setKeywords(BLANK_KEYWORD)
      setKeywords(KEYWORD)
    }

    if (mode == 'single') {
      setHint(false)
      setGuesses([])
      setLives(8)
    }
  }

  // FOR SINGLEPLAYER
  const handleTryAgain = () => {
    //  show hint
    setStatus('')
    setLives(8)
  }

  const handleLobbyInput = (e: React.FormEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value
    setLobby(prev => ({
      ...prev,
      code: newValue
    }))
  }

  const handleJoin = () => {
    if (lobby?.code) {
      socket.emit('join', {
        name: name,
        code: lobby?.code
      })
      // update current client id
      setLobby(prev => ({
        ...prev,
        client_id: socket.id
      }))
      setMode('lobby')
    }
  }

  const handleCreateLobby = async () => {
    // generate room code
    const unique_id = uuid();
    const small_id = unique_id.slice(0, 8)
    // TODO: Add try catch
    // join lobby
    console.log(name)
    socket.emit('create',
      {
        name: name,
        code: small_id
      })
    // update current client id
    setLobby(prev => ({
      ...prev,
      client_id: socket.id
    }))
    // keep track of playerID
    // keep track of lobby
    // render lobby
    setMode('lobby')

  }
  const handleLeaveLobby = async () => {
    socket.emit('leave', lobby.code)
    //  clear playerID
    //  clear lobby

    setMode('intro')
  }

  const handleStartMultiple = () => {
    // start game for all cilent
    const data = {
      code: lobby.code
    }
    socket.emit('start', data)
  }

  const socketInitializer = async () => {
    await axios.get('/api/socket')
    socket = io()
    // Whenever player join lobby
    socket.on('player-join', (msg: any) => {
      setLobby(prev => ({
        ...prev,
        code: msg.code,
        players: msg.players
      }))
    })

    // Whenever player leave
    socket.on('player-leave', (msg: any) => {
      // clear lobby 
      setLobby(prev => ({
        ...prev,
        players: msg.players
      }))
    })


    // host channel
    socket.on('update-host', (msg: any) => {
      // clear lobby
      setLobby(prev => ({
        ...prev,
        host: msg.is_host,
        code: msg.code,
        players: msg.players
      }))
    })

    // start game channel
    socket.on('start-game', (msg: any) => {
      console.log(msg)
      // render keyword
      setKeywords(msg.word)
      // render status
      setStatus('multiple')
    })

    // start game channel
    socket.on('update-game', (msg: any) => {
      
    })

    // error channel
    socket.on('update-host', (msg: any) => {
      console.log(msg)
    })
  }

  // monitor guesses
  React.useEffect(() => {
    // check if all keywords are guessed
    // TODO: IMPROVEMENT - Move this code directly to where setGuesses is performed
    checkResult(guesses, keywords.split)
  }, [guesses])

  React.useEffect(() => {
    if (!DEV) {
      if (mode === 'single') {
        fetchNewWord(GLOBALS.WORD_ROUTE, (res: any, success: boolean) => {
          if (success) {
            const splitWord = res.word.toLowerCase().split('')
            setKeywords({
              whole: res.word,
              split: splitWord
            })
            checkTts(res.word)
          }
        })
        // show instructions
        setModal(true)
      }
    } else checkTts(KEYWORD.whole)
  }, [mode])

  React.useEffect(() => {
    socketInitializer()
  }, [])

  const modalStyles = {
    content: {
      top: '50%',
      left: '50%',
      marginRight: winSize.width < 768 ? '-45%' : '',
      marginBottom: winSize.width < 768 ? '-30%' : '-5%',
      transform: 'translate(-50%, -50%)',
      background: 'black'
    },
    overlay: {
      background: "#FF00",
    }
  };

  const Speaker = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>

  )

  const Button: FC<ButtonProps> = ({ onClick, className, title }) => (
    <button className={`${className} text-white bg-black hover:bg-white hover:text-black rounded-lg border-2 p-2`} onClick={onClick}>
      {title}
    </button>
  )

  return (
    <div className={styles.container}>
      <Head>
        <title>Hangman</title>
        <meta name="description" content="Guess the word!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className='mt-[1rem] flex flex-row items-center justify-center'>
        {'hangman'.split('').map((w, idx) => (
          <Key
            key={idx}
            logo
            className='cursor-auto'
            title={w}
          />
        ))}

      </header>
      <main className='flex flex-1 flex-col min-h-screen justify-center items-center'>
        {/* INTRO */}
        {mode === 'intro' &&
          <>
            {/* Start single player */}
            <Button title='start' className='w-[10rem] uppercase mb-2' onClick={() => setMode('single')} />
            {/* Create a multiplayer lobby */}
            <form className='flex flex-col justify-center items-center'>
              <input
                id='name'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="py-[5px] pl-[7px] text-black rounded-md text-sm sm:text-base w-[10rem] h-10 mb-2"
                placeholder='Name'
                required
              />
              <Button title='create a game' className='w-[10rem] uppercase mb-2' onClick={handleCreateLobby} />
            </form>
            {/*  Join a multiplayer lobby */}
            <form className='flex flex-col justify-center items-center'>
              <input
                id='lobby'
                type='text'
                value={lobby?.code}
                onChange={handleLobbyInput}
                className="py-[5px] pl-[7px] text-black rounded-md text-sm sm:text-base w-[10rem] h-10 mb-2"
                placeholder='Lobby Code'
                required
              />
              <Button title='join a game' className='w-[10rem] uppercase' onClick={handleJoin} />
            </form>
          </>
        }
        {/* LOBBY */}
        {mode === 'lobby' &&
          <div className='flex flex-1 flex-col items-center'>
            {/* Lobby Code */}
            {/* TODO: copy on click and hidden/reveal feature */}
            <div className='w-[10rem]'>
              {lobby?.code && <div className=' text-black bg-white border-2 p-2 rounded-lg text-center mt-2'>
                <h2>Lobby Code</h2>
                <p>{lobby.code}</p>
              </div>}
            </div>
            {/* Show players in lobby */}
            {lobby.players &&
              <div className='flex flex-1 mt-2'>
                {lobby.players.map((p, idx) => {
                  if (p.id == socket.id) return;
                  return (
                    <Player key={idx} player={p} winSize={winSize} className='mr-2' />
                  )
                })}
              </div>
            }
            {/* Start & leave lobby*/}
            <div className='flex-1 flex flex-col'>
              {lobby.host &&
                <Button title='start' className='w-[10rem] uppercase mb-2' onClick={handleStartMultiple} />
              }
              <Button title='leave' className='w-[10rem] uppercase mb-2' onClick={handleLeaveLobby} />
            </div>
            {/* <p className='text-white'>{test}</p> */}
          </div>
        }
        {/* RENDER - START | CREATE GAME | JOIN GAME | NAME INPUT - SINGLE MODE */}
        {mode === 'single' && <>
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
                  <h1 className='text-white text-center text-[2rem] mb-4 capitalize'>nice job!</h1>
                  <Lottie
                    animationData={winAnimation}
                    loop={false}
                    className='w-[10rem]'
                  />
                </>
              }
              {status === 'lose' &&
                <>
                  < h1 className='text-white text-center text-[2rem] mb-4 capitalize'>nice try!</h1>
                  <Lottie
                    animationData={loseAnimation}
                    loop={true}
                    className='w-[10rem]'
                  />
                </>

              }
              {/* Lives */}
              {status === '' &&
                <Man lives={lives} winSize={winSize} />
              }

            </div>
            {/* Keyword */}
            <div className='flex flex-row lowercase text-white text-[2rem] sm:text-[4rem] leading-5 tracking-[1rem] select-none'>
              {status !== 'loading' ? keywords.split?.map((keyword, idx) => {
                const isGuessed = checkGuess(guesses, keyword)
                return (
                  <div key={idx} className='flex flex-col justify-center items-center text-center w-[2rem] sm:w-[3rem]'>
                    <div className='h-[1rem]'>
                      {isGuessed ? keyword : ' '}
                    </div>
                    <div>_</div>
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
              {tts && hint &&
                <div className='flex flex-col items-center'>
                  {/* <div className='flex flex-col items-center tracking-wide text-sm sm:text-base mb-4 animate-bounce-stop'>
                  <p
                    className='capitalize border-2 border-white rounded-lg p-2'
                  >hint!
                  </p>
                  <p className='rotate-180 absolute top-9'>^</p>
                </div> */}

                  <motion.button
                    initial='hidden'
                    animate={hint && tts ? 'visible' : 'hidden'}
                    variants={fadeVariant}
                    className=' border-2 p-2 rounded-full hover:text-black hover:bg-white text-sm animate-bounce-stop'
                    onClick={() => {
                      window.speechSynthesis.speak(tts)

                    }}
                  >
                    <Speaker />
                  </motion.button>
                </div>

              }
            </div>
          </div>
          <div className='inline-block overflow-hidden'>
            {/* POST GAME OPTIONS */}
            <motion.div
              className='flex flex-col items-center sm:flex-row sm:justify-evenly '
              initial='hidden'
              animate={status === 'win' || status === 'lose' ? 'visible' : "hiddenUp"}
              variants={slideVairant}
            >
              <button
                onClick={handleNewGame}
                className='text-white text-center p-2 mb-2 sm:mb-0 rounded-lg border-2 border-white hover:bg-white hover:text-black w-[10rem]'>
                New Word
              </button>
              {status === 'lose' ?
                <button
                  onClick={handleTryAgain}
                  className='text-white text-center p-2 rounded-lg border-2 border-white hover:bg-white hover:text-black w-[10rem]'>
                  Try Again
                </button>
                :
                <div className='w-[6rem]'></div> // force render empty div
              }
            </motion.div>
            {/* ALPHABET */}
            <motion.div
              className='flex flex-wrap items-center justify-center'
              initial='visible'
              animate={!status && !error ? 'visible' : "hiddenDown"}
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
                      const isCorrect = checkGuess(keywords.split, key)
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
        </>}
        {/* This will change status from intro to single OR multiple OR name input */}

        <div id='modals'>
          {/* Move instruction to Man component */}
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
