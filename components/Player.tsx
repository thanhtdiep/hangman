import React, { FC } from 'react'
import Man from './Man'
import { motion } from 'framer-motion';
import Lottie from "lottie-react";
import crownAnimation from '../public/lottie/crown.json';

import { faCircleH } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
interface Props {
    player: Player,
    winSize: Size,
    mode: string,
    self: boolean,
    className?: string
}
interface Size {
    width: number,
    height: number
}
interface Player {
    id: string,
    name: string,
    lives: number,
    is_host?: boolean,
    ready?: boolean,
    status?: string,
    guesses: string[]
}

const motionVariants: any = {
    hidden: {
        opacity: 0,
        position: 'absolute',
        transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 0.85 }
    },
    visible: {
        opacity: 1,
        position: 'relative',
        transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 0.85 }
    }
}

const slideVariants: any = {
    lobby: {
        x: -10,
        transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 0.85 }
    },
    ingame: {
        x: 0,
        transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 0.85 }
    }
}

const AnimatedText = () => {
    // TODO LATER: Add sequence to fade away after bounce 
    // TODO: need to add disconnect functions
    const [hide, setHide] = React.useState<boolean>(false);
    const transitionValues = {
        duration: 0.83,
        repeat: 5,
        repeatType: 'reverse',
        ease: "easeOut"
    };

    return (
        <motion.div
            transition={{
                y: transitionValues,
                width: transitionValues,
                height: transitionValues
            }}
            animate={{
                y: ["0", "-.5rem"],
            }}
            onAnimationComplete={() => setTimeout(() => { setHide(true), [2000] })}
            className={`text-center font-bold text-sm uppercase text-white ${hide ? 'opacity-0 absolute' : ''}`}
        >
            you
        </motion.div>
    )
}

const Player: FC<Props> = ({ winSize, player, mode, self, className }) => {
    //  resize when on phone
    return (
        <div className={`flex-col items-center justify-center ${player.status == 'lose' && mode == 'multiple' ? 'opacity-50' : ''}`}>
            {/* Crown for winner & SELF INDICATOR */}
            <div className='h-[2rem] flex items-center justify-center'>
                {player.status == 'win' &&
                    <Lottie
                        animationData={crownAnimation}
                        loop={true}
                        className='w-[2rem]'
                    />
                }
                {self &&
                    <div className='h-[2rem]'>
                        <AnimatedText />
                    </div>
                }
            </div>
            <div className={`${className} w-[9rem] h-[4rem] sm:w-[10rem] sm:h-[5rem] md:w-[11rem] md:h-[6rem] lg:w-[12rem] p-2 flex flex-row border-2 border-white rounded-lg justify-center items-center`}>
                <motion.div
                    className='ml-1'
                    initial='hidden'
                    variants={motionVariants}
                    animate={mode == 'multiple' ? 'visible' : 'hidden'}
                >
                    <Man className='w-[2.5rem] sm:w-[3.5rem]' winSize={winSize} small lives={player.lives} />
                </motion.div>
                <div className='flex flex-col'>
                    <motion.div
                        className='flex flex-row items-center'
                        initial='visible'
                        variants={slideVariants}
                        animate={mode == 'multiple' ? 'ingame' : 'lobby'}
                    >
                        <h2 className='text-xs sm:text-sm font-bold'>{player.name}</h2>
                        {player.is_host && <Icon icon={faCircleH} size='lg' className=' text-white ml-1 w-3 h-3 sm:w-5 sm:h-5' />}
                    </motion.div>
                    <motion.p
                        className='text-xs italic'
                        initial='hidden'
                        variants={motionVariants}
                        animate={mode == 'multiple' ? 'visible' : 'hidden'}
                    >{player.guesses.length} guesses</motion.p>
                </div>
            </div>
            {/* READY */}
            <div className='h-[2rem] flex items-center justify-center'>
                {player.ready && mode === 'lobby' &&
                    <h2 className='text-base text-white uppercase font-bold'>ready</h2>
                }
                {!player.ready && player.status !== 'in-lobby' && mode === 'lobby' ?
                    <h2 className='text-base text-white uppercase font-bold'>ingame</h2>
                    : null
                }
                {!player.ready && player.status == 'in-lobby' && mode === 'lobby' ?
                    <h2 className='text-base text-white uppercase font-bold'>in lobby</h2>
                    : null
                }
            </div>
        </div>
    )
}

export default Player;