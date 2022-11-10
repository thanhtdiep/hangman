import React, { FC } from 'react'

interface Props {
    title: string,
    className?: string,
    disabled?: boolean,
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}
const Key: FC<Props> = ({ title, className, disabled, onClick }) => {

    return (
        <button className={`flex disabled:cursor-default disabled:opacity-50 uppercase mr-2 mb-2 rounded-md justify-center items-center cursor-pointer w-14 h-14 text-xl border-2 border-white ${className}`} disabled={disabled} onClick={onClick}>
            {title}
        </button>
    )
}

export default Key;