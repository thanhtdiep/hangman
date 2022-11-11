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

const Man: FC<Props> = ({ winSize, lives, className }) => {
    const BREAKPOINT = 1028;
    const SCALE = winSize.width < BREAKPOINT ? .3 : .5
    //  resize when on phone
    return (
        <svg className={` ${className}`}
            width={500 * SCALE}
            height={500 * SCALE}
            viewBox={`0 0 ${500 * SCALE} ${500 * SCALE}`}
        >
            {/* base */}
            {lives <= 7 && <>

                <line
                    x1="0"
                    y1={500 * SCALE}
                    x2={200 * SCALE}
                    y2={500 * SCALE}
                    stroke="white"
                    strokeWidth={3}
                />
                <line
                    x1="0"
                    y1={500 * SCALE}
                    x2={100 * SCALE}
                    y2={400 * SCALE}
                    stroke="white"
                    strokeWidth={3}
                />
                <line
                    x1={100 * SCALE}
                    y1={400 * SCALE}
                    x2={200 * SCALE}
                    y2={500 * SCALE}
                    stroke="white"
                    strokeWidth={3}
                />
                <line
                    x1={100 * SCALE}
                    y1={400 * SCALE}
                    x2={100 * SCALE}
                    y2="0"
                    stroke="white"
                    strokeWidth={3}
                />
            </>
            }
            {/* hook */}
            {lives <= 6 &&
                <>
                    <line
                        x1={100 * SCALE}
                        y1="0"
                        x2={250 * SCALE}
                        y2="0"
                        stroke="white"
                        strokeWidth={3}
                    />
                    <line
                        x1={250 * SCALE}
                        y1="0"
                        x2={250 * SCALE}
                        y2={50 * SCALE}
                        stroke="white"
                        strokeWidth={3}
                    />
                </>
            }
            {/* head */}
            {
                lives <= 5 &&
                <circle
                    cx={250 * SCALE}
                    cy={90 * SCALE}
                    r={40 * SCALE}
                    stroke="white"
                    fill='transparent'
                    strokeWidth={3}
                />
            }
            {/* body */}
            {lives <= 4 &&
                <line
                    x1={250 * SCALE}
                    y1={130 * SCALE}
                    x2={250 * SCALE}
                    y2={300 * SCALE}
                    stroke="white"
                    strokeWidth={3}
                />
            }
            {/* arm l */}
            {lives <= 3 &&
                <line
                    x1={200 * SCALE}
                    y1={130 * SCALE}
                    x2={250 * SCALE}
                    y2={180 * SCALE}
                    stroke="white"
                    strokeWidth={3}
                />
            }
            {/* arm r */}
            {lives <= 2 &&
                <line
                    x1={300 * SCALE}
                    y1={130 * SCALE}
                    x2={250 * SCALE}
                    y2={180 * SCALE}
                    stroke="white"
                    strokeWidth={3}
                />
            }
            {/* leg l */}
            {lives <= 1 &&
                <line
                    x1={250 * SCALE}
                    y1={300 * SCALE}
                    x2={200 * SCALE}
                    y2={350 * SCALE}
                    stroke="white"
                    strokeWidth={3}
                />
            }
            {/* leg r */}
            {lives <= 0 &&
                <line
                    x1={250 * SCALE}
                    y1={300 * SCALE}
                    x2={300 * SCALE}
                    y2={350 * SCALE}
                    stroke="white"
                    strokeWidth={3}
                />

            }

        </svg>
    )
}

export default Man;