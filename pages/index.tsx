import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import GLOBALS from '../global.json';
import axios from 'axios';
import React, { FC } from 'react';
import Key from '../components/Key';
import Man from '../components/Man';
import Alert from '../components/Alert';
import Tags from '../components/Tags';
import LobbyComp from '../components/Lobby';
import CodeBox from '../components/CodeBox';
import Modal from 'react-modal';
import Lottie from "lottie-react";
import { motion } from 'framer-motion';
import { useWindowSize } from '../helpers/useWindowSize';
import io from 'socket.io-client'
import { v4 as uuid } from 'uuid';
import winAnimation from '../public/lottie/hangman-win.json';
import loseAnimation from '../public/lottie/hangman-lose.json';
import confettiAnimation from '../public/lottie/confetti.json';
import wcAnimation from '../public/lottie/cubes.json';

// Ably
import { configureAbly } from "@ably-labs/react-hooks";

let socket: any;
// ABLY: Initialization & and bind channels

interface Size {
  width: number,
  height: number
}
interface Error {
  type?: string,
  description: string,
  className?: string,
}
interface PlayerType {
  id: string,
  name: string,
  lives: number,
  guesses: string[],
  status: string,
  ready: boolean,
  [x: string]: any
}

interface Lobby {
  host?: boolean,
  client_id?: string,
  code?: string,
  players?: PlayerType[]
}
interface PostGame {
  description?: string,
  winner?: PlayerType
}
interface Keyword {
  whole: string,
  split: string[]
}

interface ButtonProps {
  title: string,
  className?: string,
  disabled?: boolean,
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
  whole: 'deeeeeeeeeeeeeev',
  split: ['d', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'v']
}
const BLANK_KEYWORD = {
  whole: '',
  split: []
}
const DEV = false
const MIN_PLAYER = 2
const MAX_PLAYER = 4
// TODO: Add framer animation, add check for duplicate old and new word
export default function Home() {
  const winSize: Size = useWindowSize();
  const [keywords, setKeywords] = React.useState<Keyword>(DEV ? KEYWORD : BLANK_KEYWORD)
  const [status, setStatus] = React.useState<string>('')
  const [name, setName] = React.useState<string>('')
  const [lobby, setLobby] = React.useState<Lobby>({
    code: ''
  })
  const [postGame, setPostGame] = React.useState<PostGame>()
  const [mode, setMode] = React.useState<string>('intro')
  const [guesses, setGuesses] = React.useState<string[]>([])
  const [lives, setLives] = React.useState<number>(8)
  const [modal, setModal] = React.useState<boolean>(false)
  const [hint, setHint] = React.useState<boolean>(DEV)
  const [tts, SetTts] = React.useState<SpeechSynthesisUtterance>()
  const [error, setError] = React.useState<Error>()
  const [ready, setReady] = React.useState<boolean>(false)
  const [tags, setTags] = React.useState<string[]>([])
  const [enable, setEnable] = React.useState<boolean>(false)
  const [create, setCreate] = React.useState<boolean>(false)

  // Ably presence lobby channel
  Modal.setAppElement('#modals')

  const fetchNewWord = async (url: string, cb: any) => {
    setStatus('loading')
    await axios.get(url)
      .then((res) => {
        setStatus('in-game')
        cb(res.data, true)
      })
      .catch((err) => {
        if (err.message) {
          setError({
            description: err.message
          })
        }
        if (err.error) {
          console.log(err.error)
        }
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
    if (result) return lives;
    const newLives = lives - 1
    if (newLives <= 0) {
      setStatus('lose')
      setHint(true)
      if (mode == 'multiple') {
        setPostGame({
          description: "Nice try! Let's wait for the others"
        })
      }
    }
    setLives(prev => (prev - 1))
    return newLives;
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

  const handleCheck = (splitWord: string[], key: string, status: string, lives: number) => {
    if (status == 'lose') return;
    const isCorrect = checkGuess(splitWord, key)
    const newLives = checkLives(isCorrect, lives)
    const newGuesses = [...guesses, key]
    setGuesses(newGuesses)
  }

  const handleReady = (ready: boolean) => {
    setReady(ready)
    setLobby(prev => ({
      ...prev,
      ready: ready
    }))
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
      setStatus('in-game')
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
    setStatus('in-game')
    setLives(8)
  }

  const handleLobbyInput = (e: React.FormEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value
    setLobby(prev => ({
      ...prev,
      code: newValue
    }))
  }

  // channels subscription
  const handleSubscription = async (room: string = '') => {
    // generate room code
    const newRoomId = room ? room : uuid().slice(0, 8)
    // render lobby code
    setLobby(prev => ({
      ...prev,
      host: room ? false : true,
      code: newRoomId
    }))
    setStatus('in-lobby')
    setMode('lobby')
  }

  const handleJoin = async (e: any) => {
    e.preventDefault();
    setCreate(false)
    if (!name || !lobby.code || !lobby.client_id) return;

    // render socketId
    setLobby(prev => ({
      ...prev,
      client_id: lobby.client_id
    }))
    handleSubscription(lobby.code)
  }

  const handleCreateLobby = async () => {
    setCreate(true)
    // Validation
    if (!name || !lobby.client_id) return;
    // render socketId
    setLobby(prev => ({
      ...prev,
      client_id: lobby.client_id
    }))
    handleSubscription()
  }

  const handleLeaveLobby = async () => {
    // TODO: updateLobby
    // socket.emit('leave')
    // clear states
    setLobby(prev => ({
      ...prev,
      code: ''
    }))
    setStatus('')
    setGuesses([])
    setLives(8)
    setReady(false)
    setPostGame({})
    // render intro screen
    setMode('intro')
  }

  const handleReturnLobby = async () => {
    // clear game state
    setStatus('in-lobby')
    setGuesses([])
    setLives(8)
    setPostGame({})
    // render lobby
    setMode('lobby')
  }

  const handleStartMultiple = async () => {
    // start game for all cilent
    // const data = {
    //   code: lobby.code
    // }
    await fetchNewWord(GLOBALS.WORD_ROUTE, (res: any, success: boolean) => {
      if (success) {
        var word = res.word
        const splitWord = res.word.toLowerCase().split('')
        setKeywords({
          whole: word,
          split: splitWord
        })
        checkTts('')
      }
    })
    setMode('multiple')
    setStatus('in-game')
    handleReady(false)

    // socket.emit('start', data)
  }

  const socketInitializer = async () => {
    const randomUserId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    configureAbly({
      // authUrl: '/api/ably/auth',
      key: process.env.NEXT_PUBLIC_ABLY_APP_KEY,
      clientId: randomUserId
    });
    setLobby(prev => ({
      ...prev,
      client_id: randomUserId
    }))
  }

  const handleError = (err: Error) => {
    // TODO: Handle onError of LobbyComp
    // setLobby({
    //   code: ''
    // })
    setStatus('')
    setMode('intro')
    setError(err)
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

  const Button: FC<ButtonProps> = ({ onClick, className, title, disabled }) => (
    <button disabled={disabled} className={`${className} text-white bg-black hover:bg-white hover:text-black rounded-lg border-2 p-2`}
      onClick={onClick}>
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
      {/* LOGO */}
      <header className='mt-[1rem] flex flex-row items-center justify-center select-none cursor-default'>
        {'hangman'.split('').map((w, idx) => (
          <Key
            key={idx}
            logo
            className=''
            title={w}
          />
        ))}

      </header>
      <main className={`flex flex-1 min-h-[80vh] flex-col items-center ${mode == 'intro' || mode == 'single' ? 'justify-center' : ''}`}>
        {/* BACK FOR SINGLE */}
        {mode === 'single' &&
          <Button title='back' className='absolute top-[3.5rem] z-50  sm:top-2 left-4 w-[4rem] sm:w-[5rem] uppercase text-xs sm:text-sm' onClick={() => {
            handleLeaveLobby()
          }} />
        }
        {/* PLAYER LIST */}
        {(mode === 'lobby' || mode === 'multiple') && lobby.client_id && lobby.code ?
          // TODO: Create LOBBY components
          <>
            <LobbyComp create={create} keywords={keywords} status={status} lives={lives} guesses={guesses} ready={ready} lobby={lobby} name={name} loading={status === 'loading'} mode={mode} winSize={winSize}
              onError={(err: Error) => {
                handleError(err)
              }}
              onChanges={(pList: PlayerType[]) => {
                if (pList.length < 1) return;
                let allReady = true
                let gameOver = true
                let noHost = true
                pList.map(p => {
                  // handle start lobby
                  if (p.is_host && p.keywords && p.status == 'in-game' && status == 'in-lobby') {
                    setKeywords(p.keywords)
                    setMode('multiple')
                    setStatus('in-game')
                    setReady(false)
                  }

                  // check winner
                  if (p.id !== lobby.client_id && p.status == 'win' && mode == 'multiple') {
                    // set Postgame
                    setPostGame({
                      winner: p
                    })
                    setStatus('lose')
                    console.log('found winner')
                  }

                  // check game over
                  if (p.lives > 0) {
                    gameOver = false
                  }

                  // check all ready
                  if (!p.ready) {
                    allReady = false
                  }

                  // check host
                  if (p.is_host) {
                    noHost = false
                  }

                  // TAGS
                  let arr = [];
                  const count = pList.length;
                  arr.push(`${count}/${MAX_PLAYER}`)

                  // not enough player
                  if (pList.length < 2) {
                    arr.push('Min player is 2')
                  }
                  setTags(arr)
                })

                // enable start game button
                setEnable(allReady && pList.length > 1 && pList.length < 5 ? true : false)
                // check game over
                if (status == 'lose' && gameOver) {
                  console.log('no one wins')
                  // set postgame since no one wins
                  setPostGame({
                    description: "No one found the hidden word. Nice try tho!"
                  })
                }

                // pass host to first person in lobby, if noone has lead
                if (noHost && pList[0].id == lobby.client_id) {
                  setLobby(prev => ({
                    ...prev,
                    host: true
                  }))
                }
              }} />
            {/* TAGS */}
            {mode === 'lobby' &&
              <Tags tags={tags} className='my-[2rem]' />
            }
          </>
          : null
        }
        {/* INTRO */}
        {mode === 'intro' &&
          <div className='absolute bottom-20'>
            {/* Start single player */}
            <div className='flex flex-col mb-2'>
              <h1 className='uppercase border-b-2 border-white mb-2'>single player</h1>
              <Button title='start' className='w-[10rem] uppercase mb-2' onClick={() => setMode('single')} />
            </div>
            {/* Create a multiplayer lobby */}
            <div className='flex flex-col'>
              <h1 className='uppercase border-b-2 border-white mb-2'>multiplayer</h1>
              <input
                id='name'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="py-[5px] pl-[7px] text-black rounded-md text-sm sm:text-base w-[10rem] h-10 mb-2"
                placeholder='Name'
                required
              />
              <input
                id='lobby'
                type='text'
                value={lobby?.code}
                onChange={handleLobbyInput}
                className="py-[5px] pl-[7px] text-black rounded-md text-sm sm:text-base w-[10rem] h-10 mb-2"
                placeholder='Lobby Code'
                required
              />
              <Button disabled={name ? false : true} title='create a game' className='disabled:opacity-50 w-[10rem] uppercase mb-2' onClick={handleCreateLobby} />
              {/*  Join a multiplayer lobby */}
              <Button disabled={name && lobby.code ? false : true} title='join a game' className='disabled:opacity-50 w-[10rem] uppercase' onClick={handleJoin} />
            </div>

          </div>
        }
        {/* LOBBY */}
        {mode === 'lobby' &&
          <div className='flex flex-1 flex-col items-center'>
            {/* Loader */}
            {status == 'loading' &&
              <div className='flex items-center'>
                <Lottie
                  animationData={wcAnimation}
                  loop={true}
                  className='w-[7rem] bg-gray-00 rounded-full pointer-events-none'
                />
              </div>
            }
            {/* Lobby Code */}
            {lobby.code &&
              <CodeBox
                code={lobby?.code}
                className='mt-2 transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-300'
                onClick={() => {
                  if (lobby.code) navigator.clipboard.writeText(lobby.code)
                  const alert = {
                    description: 'Copied',
                    className: 'bg-positive-green'
                  }
                  setError(alert)
                }}
              />
            }
            {/* Start & leave lobby*/}
            <div className='flex-1 flex flex-col'>
              {status == 'in-lobby' && lobby.host ?
                <Button title='start' disabled={!enable} className={`w-[10rem] uppercase mb-2 ${enable ? '' : 'opacity-50'}`}
                  onClick={handleStartMultiple} />
                : null
              }
              <Button title={ready ? 'unready' : 'ready'} className='w-[10rem] uppercase mb-2' onClick={() => handleReady(!ready)} />
              <Button title='leave' className='w-[10rem] uppercase mb-2' onClick={handleLeaveLobby} />
            </div>
            {/* <p className='text-white'>{test}</p> */}
          </div>
        }
        {/* RENDER - START | CREATE GAME | JOIN GAME | NAME INPUT - SINGLE MODE */}
        {mode === 'single' || mode === 'multiple' ?
          <div className='relative flex flex-col items-center sm:bottom-20'>
            {/*  */}
            {status === 'win' &&
              <Lottie
                animationData={confettiAnimation}
                loop={false}
                className='absolute bottom-0 z-30 w-full pointer-events-none'
              />}
            <div className='flex w-full flex-col lg:flex-row justify-evenly items-center mb-8 sm:my-20 '>
              {/* Win or Lose message */}
              <div className='flex flex-col items-center justify-center mb-2 sm:mb-16 lg:mb-0 w-[250px] lg:w-[150px] h-[250px] lg:h-[150px] '>
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
                {status === 'in-game' &&
                  <Man lives={lives} winSize={winSize} />
                }

              </div>
              {/* Keyword */}
              <div className={`flex flex-row lowercase items-center text-white sm:text-[4rem] xs:text-[2rem] text-[1rem] leading-5 tracking-[1rem] select-none`}>
                <div className='flex flex-row flex-wrap'>
                  {status !== 'loading' ?
                    keywords.split?.map((keyword, idx) => {
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
                          className='cursor-auto'
                          title={w}
                        />
                      ))}
                    </>
                  }

                </div>
                {tts && hint && mode !== 'multiple' &&
                  <div className='flex flex-col items-center'>
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
                {mode == 'single' &&
                  <>
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
                      <div className='w-[10rem]'></div> // force render empty div
                    }
                  </>
                }
                {/* MULTIPLE */}
                {mode == 'multiple' && (postGame || status == 'win') ?
                  <>
                    {postGame?.winner ?
                      // found a winner
                      <div className='mb-2 sm:mb-0'>
                        <h2>{postGame.winner.name} has found the word </h2>
                        <p>
                          with {postGame.winner.guesses.length} tries!
                        </p>
                      </div>
                      :
                      // everyone ran out of lives
                      <div className='mb-2 sm:mb-0'>
                        {postGame?.description}
                      </div>
                    }
                    {/* Return to lobby */}
                    <Button title='return to lobby' className='w-[10rem] uppercase mb-2' onClick={handleReturnLobby} />
                    {/* Quit */}
                    <Button title='quit' className='w-[10rem] uppercase mb-2' onClick={handleLeaveLobby} />
                  </>
                  : null
                }
              </motion.div>
              {/* ALPHABET */}
              <motion.div
                className='flex flex-wrap items-start justify-center'
                initial='visible'
                animate={status === 'in-game' ? 'visible' : "hiddenDown"}
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
                        handleCheck(keywords.split, key, status, lives)
                      }} />
                  )
                })}
              </motion.div>
            </div>
          </div>
          : null
        }
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

        {/* ERROR BOX */}
        <div className='absolute bottom-4 h-[4rem]'>
          {error &&
            <Alert error={error} className='mb-2' />
          }
        </div>
      </main >

      {/* <footer className={styles.footer}>
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
      </footer> */}
    </div >
  )
}
