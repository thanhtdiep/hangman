import { ButtonProps } from "types";
import { FC } from "react";

const Button: FC<ButtonProps> = ({ onClick, className, title, disabled }) => (
  <button
    disabled={disabled}
    className={`${className} text-white bg-black hover:bg-white hover:text-black rounded-lg border-2 p-2`}
    onClick={onClick}
  >
    {title}
  </button>
);

export default Button;
