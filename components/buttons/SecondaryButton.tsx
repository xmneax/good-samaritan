import { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    className?: string;
}

export const SecondaryButton = ({ children, className, type = "button", ...props }: SecondaryButtonProps) => {
    return (
        <button
            type={type}
            className={clsx(
                "w-full py-3 px-5 rounded-xl font-semibold tracking-wide transition-all duration-200",
                "bg-white/80 text-violet-700 border-2 border-violet-200",
                "hover:bg-violet-50 hover:border-violet-300 active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                className
            )}
            {...props}>
            {children}
        </button>
    );
};
