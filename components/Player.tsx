import React, { FC } from 'react'

interface Props {
    lives: number,
    winSize: Size,
    className?: string
}

interface Size {
    width: number,
    height: number
}

const Player: FC<Props> = ({ winSize, lives, className }) => {
    const BREAKPOINT = 1028;
    const SCALE = winSize.width < BREAKPOINT ? .3 : .5
    //  resize when on phone
    return (
        <div>

        </div>
    )
}

export default Player;