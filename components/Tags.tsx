import React, { FC } from 'react';
import { motion } from 'framer-motion';

interface Props {
    className?: string,
    tags: string[]
}

const slideVariants = {
    hidden: {
        y: '-200%',
        transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 0.83 },

    },
    visible: {
        y: 0,
        transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 0.83 }
    }
}

const Tags: FC<Props> = ({ tags, className }) => {
    return (
        <div className={`overflow-hidden flex flex-row ${className}`}>
            {tags.map((t, idx) => (
                <motion.div
                    key={idx}
                    className='flex rounded-full ml-2 bg-white text-black font-bold text-xs sm:text-sm py-2 px-3'
                    initial='hidden'
                    variants={slideVariants}
                    animate={t ? 'visible' : 'hidden'}
                >
                    {t}
                </motion.div>
            ))}
        </div>

    )
}

export default Tags;