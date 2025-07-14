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
                "w-full bg-[rgba(255,255,255,0.2)] text-white border-2 border-white py-3 px-4 rounded-lg font-bold tracking-wide cursor-pointer disabled:cursor-default",
                className
            )}
            {...props}>
            {children}
        </button>
    );
};
