import React, { FC } from 'react'
import Man from './Man'
import Lottie from "lottie-react";
import crownAnimation from '../public/lottie/crown.json';
interface Props {
    player: Player,
    winSize: Size,
    className?: string
}
interface Size {
    width: number,
    height: number
}
interface Player {
    id: number,
    name: string,
    lives: number,
    is_host?: boolean,
    guesses: string[]
}

const Player: FC<Props> = ({ winSize, player, className }) => {
    //  resize when on phone
    return (
        <div className='flex flex-col items-center '>
            {player.is_host ?
                <Lottie
                    animationData={crownAnimation}
                    loop={true}
                    className='w-[2rem]'
                />
                : <div className='h-[2rem]'></div>
            }
            <div className={`${className} w-[10rem] h-[5rem] p-2 flex flex-row border-2 border-white rounded-lg justify-center items-center`}>

                <Man className='w-[4rem] ' winSize={winSize} small lives={player.lives} />
                <div className='flex flex-col'>
                    <h2 className='font-bold'>{player.name}</h2>
                    <p>Guesses: {player.guesses.length}</p>
                </div>
            </div>
        </div>
    )
}

export default Player;