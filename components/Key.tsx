import React, { FC } from 'react'

interface Props {
    title: string,
    className?: string,
    disabled?: boolean,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}
const Key: FC<Props> = ({ title, className, disabled, onClick }) => {

    return (
        <button className={`${className}`} disabled={disabled} onClick={onClick}>
            {title}
        </button>
    )
}

export default Key;