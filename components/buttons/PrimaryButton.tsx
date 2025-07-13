import { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    className?: string;
}

export const PrimaryButton = ({ children, className, type = "button", ...props }: PrimaryButtonProps) => {
    return (
        <button type={type} className={clsx("w-full bg-white text-destructive py-3 px-4 rounded-lg font-bold tracking-wide disabled:opacity-50", className)} {...props}>
            {children}
        </button>
    );
};
