import React, { FC } from "react";

interface Props {
  title: string;
  className?: string;
  disabled?: boolean;
  logo?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
const Key: FC<Props> = ({ title, className, disabled, logo, onClick }) => {
  return (
    <button
      className={`flex text-white disabled:cursor-default disabled:opacity-50 uppercase mr-2 rounded-md justify-center items-center ${
        logo
          ? "w-6 h-6 text-[.7rem] pl-[.05rem]  cursor-default"
          : "w-10 h-10 sm:w-14 sm:h-14 text-lg sm:text-xl mb-2  cursor-pointer"
      }  border-2 border-white ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {title}
    </button>
  );
};

export default Key;
