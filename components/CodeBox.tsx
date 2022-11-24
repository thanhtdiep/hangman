import React, { FC } from 'react';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'

interface Props {
    className?: string,
    code: string,
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
}

function format(value: string, pattern: string) {
    let i = 0;
    const v = value.toString();
    return pattern.replace(/#/g, _ => v[i++]);
}

const CodeBox: FC<Props> = ({ code, className, onClick }) => {
    const [reveal, setReveal] = React.useState<boolean>(false)
    return (
        <div className={`w-[10rem] cursor-pointer ${className}`}>
            <div className=' text-black bg-white border-2 p-2 rounded-lg font-bold text-xs sm:text-sm text-center mb-2'
                onClick={onClick}
            >
                <h2>Lobby Code</h2>
                <div className='flex flex-row items-center justify-center'>
                    <p>{reveal ? code : format(code, '********')}</p>
                    <div className='absolute z-50 -mr-[6rem] hover:bg-gray-100 bg-transparent rounded-full ml-1 p-1'
                        onClick={() => setReveal(!reveal)}
                    >
                        {reveal ?
                            <Icon icon={faEyeSlash} size='lg' className=' text-black w-3 h-3 sm:w-4 sm:h-4' />
                            :
                            <Icon icon={faEye} size='lg' className=' text-black w-3 h-3 sm:w-4 sm:h-4' />
                        }
                    </div>
                </div>
            </div>
        </div>

    )
}

export default CodeBox;