import React, { FC } from 'react'

interface Props {
    title: string,
    className?: string,
    disabled?: boolean,
    logo?: boolean,
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}
const Key: FC<Props> = ({ title, className, disabled, logo, onClick }) => {

    return (
        <button
            className={`flex text-white disabled:cursor-default disabled:opacity-50 uppercase mr-2 rounded-md justify-center items-center cursor-pointer ${logo ? 'w-7 h-7 text-sm mb-1': 'w-14 h-14 text-xl mb-2'}  border-2 border-white ${className}`} disabled={disabled} onClick={onClick}>
            {title}
        </button>
    )
}

export default Key;