import React, { FC } from 'react';
import { motion } from 'framer-motion';

interface Props {
    className?: string,
    error?: Error
}

interface Error {
    type?: string,
    description: string,
    className?: string,
}

const slideVariants = {
    hidden: {
        y: '200%',
        transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 0.83 },

    },
    visible: {
        y: 0,
        transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 0.83 }
    }
}

const Alert: FC<Props> = ({ error, className }) => {
    const [show, setShow] = React.useState<boolean>(false)
    React.useEffect(() => {
        setShow(true)
        setTimeout(() => {
            setShow(false)
        }, 3000)
    }, [error])
    return (
        <div className={`overflow-hidden inline-block ${className}`}>
            <motion.div
                className='flex bg-transparent border-2 rounded-lg border-gray-600 pr-4 text-xs sm:text-sm'
                initial='hidden'
                variants={slideVariants}
                animate={show ? 'visible' : 'hidden'}
            >
                <div className={`${error?.className} rounded-l-md w-[1rem] mr-2`}></div>
                <p className='py-2'>{error?.description}</p>
            </motion.div>
        </div>

    )
}

export default Alert;