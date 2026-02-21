"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { User } from "@/lib/mongodb/types";
import { Check, Loader2, Wallet, X } from "lucide-react";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { onIncompletePaymentFound } from "@/lib/pinetwork/callbacks";
import { signIn } from "@/app/actions";
import Link from "next/link";
import { checkWalletAddress, createTransaction } from "@/lib/stellar";

export type Toast = {
    type: "success" | "error";
    message: string;
};

export default function PiAppClient() {
    const [appStage, setAppStage] = useState("welcome"); // welcome, claim, walletInput, success, error, debug
    const [user, setUser] = useState<User | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [walletAddress, setWalletAddress] = useState("");
    const [debugInfo, setDebugInfo] = useState<string>("");

    const handleStage = (stage: string) => setAppStage(stage);

    const handleLogin = async () => {
        if (user) {
            const nextStage = user.wallet ? "claim" : "walletInput";
            if (user.wallet) setWalletAddress(user.wallet);
            return handleStage(nextStage);
        }

        try {
            setIsLoading(true);
            const scopes = ["username", "payments", "wallet_address"];

            const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Login request timed out. Please try again using the Pi Browser.")), 15000));

            // Add timeout to factor in the user not using Pi Browser
            const auth = await Promise.race([window.Pi.authenticate(scopes, onIncompletePaymentFound), timeout]);

            const response = await signIn(auth.accessToken);

            if (!response.success) {
                setIsLoading(false);
                return setToast({ type: "error", message: response.message });
            }

            const userData = response.data as User;
            
            // Try multiple possible wallet field locations from Pi SDK
            const authUser = (auth as { user?: Record<string, unknown> }).user;
            const walletFromAuth = 
                authUser?.wallet_address as string | undefined ??
                authUser?.wallet as string | undefined ??
                authUser?.walletAddress as string | undefined ??
                (auth as { wallet_address?: string }).wallet_address ??
                (auth as { wallet?: string }).wallet;
            
            const mergedUser = { ...userData, wallet: userData.wallet ?? walletFromAuth };
            
            // DEBUG: Show what Pi SDK returned (temporary - remove after testing)
            const debugData = {
                "auth keys": Object.keys(auth),
                "auth.user": authUser ? Object.keys(authUser) : "undefined",
                "auth.user full": authUser,
                "walletFromAuth": walletFromAuth ?? "not found",
                "userData.wallet": userData.wallet ?? "not found",
                "final wallet": mergedUser.wallet ?? "not found"
            };
            setDebugInfo(JSON.stringify(debugData, null, 2));
            setIsLoading(false);
            setUser(mergedUser);
            handleStage("debug");
        } catch (error) {
            console.error("Sign in error:", error);
            setIsLoading(false);
            setToast({
                type: "error",
                message: error instanceof Error ? error.message : "An error occurred while signing in. Please try again!",
            });
        }
    };

    const handleClaim = async () => {
        if (!user?.wallet) return;
        setIsLoading(true);
        const checkResult = await checkWalletAddress(user.wallet, {
            piUid: user.uid,
            piWalletAddress: user.wallet,
        });
        if (!checkResult.success) {
            setIsLoading(false);
            return setToast({ type: "error", message: checkResult.message });
        }
        const txResult = await createTransaction(user.wallet, user.uid);
        setIsLoading(false);
        if (txResult.success) {
            handleStage("success");
        } else {
            setToast({ type: "error", message: txResult.message });
            handleStage("error");
        }
    };

    const handleWalletAddress = async () => {
        setIsLoading(true);

        if (!walletAddress || !walletAddress.startsWith("G")) {
            setIsLoading(false);
            return setToast({ type: "error", message: "Invalid wallet address. Must start with 'G'." });
        }

        if (walletAddress.length < 50) {
            setIsLoading(false);
            return setToast({ type: "error", message: "Invalid wallet address. Wallet address length too short." });
        }

        const checkResult = await checkWalletAddress(walletAddress, {
            piUid: user?.uid,
            piWalletAddress: user?.wallet,
        });

        if (!checkResult.success) {
            setIsLoading(false);
            return setToast({ type: "error", message: checkResult.message });
        }

        const txResult = await createTransaction(walletAddress, user?.uid);
        setIsLoading(false);
        if (txResult.success) {
            handleStage("success");
        } else {
            setToast({ type: "error", message: txResult.message });
            handleStage("error");
        }
    };

    const renderAppContent = () => {
        switch (appStage) {
            case "welcome":
                return (
                    <div className="w-full max-w-md flex flex-col justify-center items-center p-6">
                        <div className="w-full bg-white rounded-2xl shadow-xl shadow-violet-100/50 p-8 flex flex-col items-center gap-y-8">
                            <div className="relative rounded-2xl overflow-hidden ring-2 ring-violet-100">
                                <Image src={"/logo.png"} alt={"logo"} width={96} height={96} className="rounded-2xl" />
                            </div>

                            <div className="flex flex-col items-center gap-y-4 text-center">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome, Pioneer!</h1>
                                <p className="text-gray-600 text-base leading-relaxed max-w-sm">
                                    Need 0.01 Pi to move your lockups? We&#39;ve got you covered.
                                </p>
                                <div className="space-y-2 text-left w-full max-w-sm text-sm text-gray-600">
                                    <p className="font-medium text-gray-700">Get 0.01 Pi in two steps:</p>
                                    <ol className="list-decimal list-inside space-y-1.5 pl-1">
                                        <li>
                                            <span className="font-semibold text-gray-800">Login</span> – Connect your Pi account.
                                        </li>
                                        <li>
                                            <span className="font-semibold text-gray-800">Claim</span> – One tap to receive 0.01 Pi and release your lockups.
                                        </li>
                                    </ol>
                                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                        You may be asked to enter your wallet address to ensure the Pi reaches you. Have it ready from Pi Browser → Wallet. Please note: this is a one-time help only.
                                    </p>
                                </div>
                            </div>

                            <div className="w-full flex flex-col gap-4 max-w-[280px]">
                                <PrimaryButton onClick={handleLogin} disabled={isLoading}>
                                    <div className="flex items-center justify-center gap-2">
                                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Wallet size={20} />}
                                        {isLoading ? "Signing in..." : "Login with Pi Network"}
                                    </div>
                                </PrimaryButton>
                                <SecondaryButton disabled={isLoading}>
                                    <Link href="/" className="block">Cancel</Link>
                                </SecondaryButton>
                            </div>
                        </div>
                    </div>
                );

            case "claim":
                return (
                    <div className="w-full max-w-md flex flex-col justify-center items-center p-6">
                        <div className="w-full bg-white rounded-2xl shadow-xl shadow-violet-100/50 p-8 flex flex-col gap-y-8">
                            <div className="flex flex-col items-center gap-y-2 text-center">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Claim 0.01 Pi</h1>
                                <p className="text-gray-600 text-sm">
                                    Sending to your Pi wallet
                                </p>
                                {user?.wallet && (
                                    <p className="text-gray-500 font-mono text-xs break-all px-2">
                                        {user.wallet.slice(0, 12)}...{user.wallet.slice(-8)}
                                    </p>
                                )}
                            </div>

                            <div className="w-full flex flex-col gap-4 max-w-[280px]">
                                <PrimaryButton onClick={handleClaim} disabled={isLoading}>
                                    <div className="flex items-center justify-center gap-2">
                                        {isLoading && <Loader2 size={20} className="animate-spin" />}
                                        {isLoading ? "Sending..." : "Claim"}
                                    </div>
                                </PrimaryButton>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setWalletAddress("");
                                        handleStage("walletInput");
                                    }}
                                    className="text-sm text-violet-600 hover:text-violet-700 underline"
                                >
                                    Use different wallet
                                </button>
                                <SecondaryButton disabled={isLoading}>
                                    <Link href="/" className="block">Cancel</Link>
                                </SecondaryButton>
                            </div>
                        </div>
                    </div>
                );

            case "walletInput":
                return (
                    <div className="w-full max-w-md flex flex-col justify-center items-center p-6">
                        <div className="w-full bg-white rounded-2xl shadow-xl shadow-violet-100/50 p-8 flex flex-col gap-y-8">
                            <div className="flex flex-col items-center gap-y-2 text-center">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Wallet Address</h1>
                                <p className="text-gray-600 text-sm">Enter your wallet address</p>
                            </div>

                            <div className="flex flex-col gap-y-3">
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border-2 border-violet-100 rounded-xl p-4 text-gray-800 font-mono text-sm placeholder:text-gray-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-colors"
                                    placeholder="Paste full address (56 characters, starts with G)"
                                    value={walletAddress}
                                    maxLength={56}
                                    onChange={(e) => setWalletAddress(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())}
                                />
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Use copy-paste. Full address is 56 characters. Avoid mixing 0 (zero) and O (letter).
                                </p>
                            </div>

                            <div className="w-full flex flex-col gap-4">
                                <PrimaryButton onClick={handleWalletAddress} disabled={isLoading || !walletAddress}>
                                    <div className="flex items-center justify-center gap-2">
                                        {isLoading && <Loader2 size={20} className="animate-spin" />}
                                        {isLoading ? "Sending..." : "Confirm Address"}
                                    </div>
                                </PrimaryButton>
                                <SecondaryButton disabled={isLoading}>
                                    <Link href="/" className="block">Cancel</Link>
                                </SecondaryButton>
                            </div>
                        </div>
                    </div>
                );

            case "success":
                return (
                    <div className="w-full max-w-md flex flex-col justify-center items-center p-6">
                        <div className="w-full bg-white rounded-2xl shadow-xl shadow-violet-100/50 p-8 flex flex-col items-center gap-y-8">
                            <div className="rounded-full w-16 h-16 flex justify-center items-center bg-emerald-400 text-white shadow-lg shadow-emerald-200/50">
                                <Check size={36} strokeWidth={2.5} />
                            </div>

                            <div className="flex flex-col items-center gap-y-2 text-center">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Transfer Complete!</h1>
                                <p className="text-gray-600">0.01 Pi has been sent to your wallet</p>
                            </div>

                            <div className="w-full flex flex-col gap-3 max-w-[280px]">
                                <a
                                    href="https://pinet.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-3 px-5 rounded-xl font-semibold tracking-wide transition-all duration-200 bg-violet-500 text-white shadow-sm shadow-violet-200/50 hover:bg-violet-600 hover:shadow-md hover:shadow-violet-200/60 active:scale-[0.98] text-center block"
                                >
                                    Pi Ecosystem
                                </a>
                                {process.env.NEXT_PUBLIC_PINET_URL && (
                                    <a
                                        href={process.env.NEXT_PUBLIC_PINET_URL}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full py-3 px-5 rounded-xl font-semibold tracking-wide transition-all duration-200 bg-white/80 text-violet-700 border-2 border-violet-200 hover:bg-violet-50 hover:border-violet-300 active:scale-[0.98] text-center block"
                                    >
                                        Visit Boostr
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case "error":
                return (
                    <div className="w-full max-w-md flex flex-col justify-center items-center p-6">
                        <div className="w-full bg-white rounded-2xl shadow-xl shadow-violet-100/50 p-8 flex flex-col items-center gap-y-8">
                            <div className="rounded-full w-16 h-16 flex justify-center items-center bg-rose-400 text-white shadow-lg shadow-rose-200/50">
                                <X size={36} strokeWidth={2.5} />
                            </div>

                            <div className="flex flex-col items-center gap-y-2 text-center">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Error Occurred!</h1>
                                <p className="text-gray-600">The blockchain is busy right now. Please try again!</p>
                            </div>

                            <div className="w-full flex flex-col gap-3 max-w-[280px]">
                                <a
                                    href="https://pinet.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-3 px-5 rounded-xl font-semibold tracking-wide transition-all duration-200 bg-violet-500 text-white shadow-sm shadow-violet-200/50 hover:bg-violet-600 hover:shadow-md hover:shadow-violet-200/60 active:scale-[0.98] text-center block"
                                >
                                    Pi Ecosystem
                                </a>
                                {process.env.NEXT_PUBLIC_PINET_URL && (
                                    <a
                                        href={process.env.NEXT_PUBLIC_PINET_URL}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full py-3 px-5 rounded-xl font-semibold tracking-wide transition-all duration-200 bg-white/80 text-violet-700 border-2 border-violet-200 hover:bg-violet-50 hover:border-violet-300 active:scale-[0.98] text-center block"
                                    >
                                        Visit Boostr
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case "debug":
                return (
                    <div className="w-full max-w-md flex flex-col justify-center items-center p-6">
                        <div className="w-full bg-white rounded-2xl shadow-xl shadow-violet-100/50 p-4 flex flex-col gap-y-4">
                            <h1 className="text-lg font-bold text-gray-800 text-center">Debug: Pi SDK Response</h1>
                            <pre className="text-xs bg-gray-100 p-3 rounded-lg overflow-auto max-h-80 whitespace-pre-wrap break-all">
                                {debugInfo}
                            </pre>
                            <p className="text-xs text-gray-500 text-center">
                                Screenshot this and share it. Then tap Continue.
                            </p>
                            <PrimaryButton onClick={() => {
                                if (user?.wallet) {
                                    setWalletAddress(user.wallet);
                                    handleStage("claim");
                                } else {
                                    handleStage("walletInput");
                                }
                            }}>
                                Continue
                            </PrimaryButton>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    useEffect(() => {
        if (!toast) return;

        const timer = setTimeout(() => {
            setToast(null);
        }, 5000);

        return () => clearTimeout(timer);
    }, [toast]);

    return (
        <div className="w-full flex justify-center items-center">
            {toast && (
                <div className="absolute top-20 left-0 right-0 z-50 w-fit mx-auto px-4">
                    <p className={clsx(
                        "text-sm font-semibold py-3 px-5 rounded-xl shadow-lg leading-relaxed tracking-wide",
                        toast.type === "error"
                            ? "bg-rose-400 text-white shadow-rose-200/50"
                            : "bg-emerald-400 text-white shadow-emerald-200/50"
                    )}>
                        {toast.message}
                    </p>
                </div>
            )}
            {renderAppContent()}
        </div>
    );
}
