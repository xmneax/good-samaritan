import { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    className?: string;
}

export const PrimaryButton = ({ children, className, type = "button", ...props }: PrimaryButtonProps) => {
    return (
        <button
            type={type}
            className={clsx(
                "w-full py-3 px-5 rounded-xl font-semibold tracking-wide transition-all duration-200",
                "bg-violet-500 text-white shadow-sm shadow-violet-200/50",
                "hover:bg-violet-600 hover:shadow-md hover:shadow-violet-200/60 active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none",
                className
            )}
            {...props}>
            {children}
        </button>
    );
};
