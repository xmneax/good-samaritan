"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { User } from "@/lib/mongodb/types";
import { Check, Loader2, X } from "lucide-react";
import WelcomeModal from "@/components/WelcomeModal";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { onIncompletePaymentFound } from "@/lib/pinetwork/callbacks";
import { signIn } from "@/app/actions";
import { AdsSection } from "@/components/AdsSection";
import Link from "next/link";
import { checkWalletAddress } from "@/lib/stellar";

export type Toast = {
    type: "success" | "error";
    message: string;
};

export default function PiAppClient() {
    const [showWelcomeModal, setShowWelcomeModal] = useState(true);
    const [appStage, setAppStage] = useState("welcome"); // welcome, login, walletInput, adView, success, error
    const [user, setUser] = useState<User | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [walletAddress, setWalletAddress] = useState("");

    const handleStage = (stage: string) => setAppStage(stage);

    const handleWelcomeModalClose = () => {
        setShowWelcomeModal(false);
    };

    const handleLogin = async () => {
        if (user) return handleStage("walletInput");

        try {
            setIsLoading(true);
            const scopes = ["username", "payments", "wallet_address"];

            const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Login request timed out. Please try again using the Pi Browser.")), 15000));

            // Add timeout to factor in the user not using Pi Browser
            const { accessToken } = await Promise.race([window.Pi.authenticate(scopes, onIncompletePaymentFound), timeout]);

            const response = await signIn(accessToken);

            if (!response.success) {
                setIsLoading(false);
                return setToast({ type: "error", message: response.message });
            }

            setIsLoading(false);
            setUser(response.data as User);
            handleStage("walletInput");
        } catch (error) {
            console.error("Sign in error:", error);
            setIsLoading(false);
            setToast({
                type: "error",
                message: error instanceof Error ? error.message : "An error occurred while signing in. Please try again!",
            });
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

        const result = await checkWalletAddress(walletAddress);

        if (result.success) {
            setIsLoading(false);
            handleStage("adView");
        } else {
            setIsLoading(false);
            setToast({ type: "error", message: result.message });
        }
    };

    const renderAppContent = () => {
        switch (appStage) {
            case "welcome":
                return (
                    <div className="w-full max-w-md flex flex-col justify-center items-center gap-y-10 p-4">
                        <div className="relative rounded-xl">
                            <Image src={"/logo.png"} alt={"logo"} width={90} height={90} className="rounded-xl" />
                        </div>

                        <div className="flex flex-col items-center gap-y-2">
                            <h1>Good Samaritan</h1>

                            <p className="text-center font-medium">Need 0.01 Pi to move your lockups? We&#39;ve got you covered!</p>
                        </div>

                        <PrimaryButton onClick={() => handleStage("walletInput")}>Get Started</PrimaryButton>
                    </div>
                );

            /*case "login":
                return (
                    <div className="w-full max-w-md flex flex-col justify-center items-center gap-y-10 p-4">
                        <div className="flex flex-col items-center gap-y-2">
                            <h1>Login with Pi</h1>

                            <p className="text-center font-medium">Connect your Pi Network account to continue</p>
                        </div>

                        <div className="w-full flex flex-col items-center gap-y-4">
                            <PrimaryButton onClick={handleLogin} disabled={isLoading}>
                                <div className="flex items-center justify-center gap-2">
                                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Wallet size={20} />}
                                    {isLoading ? "Signing in..." : "Login with Pi Network"}
                                </div>
                            </PrimaryButton>

                            <SecondaryButton disabled={isLoading}>
                                <Link href="/ecosystem">Cancel</Link>
                            </SecondaryButton>
                        </div>
                    </div>
                );*/

            case "walletInput":
                return (
                    <div className="w-full max-w-md flex flex-col gap-y-10 p-4">
                        <div className="flex flex-col items-center gap-y-2">
                            <h1>Wallet Address</h1>
                            <p className="text-center font-medium">Enter your wallet address</p>
                        </div>

                        <input
                            type="text"
                            className="w-full bg-white p-3 rounded-lg text-black"
                            placeholder="Enter your wallet address"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())}
                        />

                        <div className="w-full flex flex-col items-center gap-y-4">
                            <PrimaryButton onClick={handleWalletAddress} disabled={isLoading || !walletAddress}>
                                <div className="flex items-center justify-center gap-2">
                                    {isLoading && <Loader2 size={20} className="animate-spin" />}
                                    Confirm Address
                                </div>
                            </PrimaryButton>

                            <SecondaryButton disabled={isLoading}>
                                <Link href="/ecosystem">Cancel</Link>
                            </SecondaryButton>
                        </div>
                    </div>
                );

            case "adView":
                return <AdsSection walletAddress={walletAddress} setAppStage={setAppStage} setToast={setToast} />;

            case "success":
                return (
                    <div className="w-full max-w-md flex flex-col justify-center items-center gap-y-10 p-4">
                        <div className="rounded-full w-18 h-18 flex justify-center items-center bg-green-600">
                            <Check size={40} />
                        </div>

                        <div className="flex flex-col items-center gap-y-2">
                            <h1>Transfer Complete!</h1>
                            <p className="text-center font-medium">0.01 Pi has been sent to your wallet</p>
                        </div>

                        <div className="relative w-full h-60 bg-[rgba(255,255,255,0.2)] flex justify-center items-center rounded-md">
                            <a href="https://boostr8732.pinet.com" target="_blank" rel="noreferrer">
                                <Image src={"/ad.webp"} alt={"ads"} fill className="rounded-md" />
                            </a>
                        </div>

                        <PrimaryButton>
                            <Link href="/ecosystem">Continue</Link>
                        </PrimaryButton>
                    </div>
                );

            case "error":
                return (
                    <div className="w-full max-w-md flex flex-col justify-center items-center gap-y-10 p-4">
                        <div className="rounded-full w-18 h-18 flex justify-center items-center bg-red-600">
                            <X size={40} />
                        </div>

                        <div className="flex flex-col items-center gap-y-2">
                            <h1>Error Occurred!</h1>
                            <p className="text-center font-medium">The blockchain is busy right now. Please try again!</p>
                        </div>

                        <div className="relative w-full h-60 bg-[rgba(255,255,255,0.2)] flex justify-center items-center rounded-md">
                            <a href="https://boostr8732.pinet.com" target="_blank" rel="noreferrer">
                                <Image src={"/ad.webp"} alt={"ads"} fill className="rounded-md" />
                            </a>
                        </div>

                        <PrimaryButton>
                            <Link href="/ecosystem">Continue</Link>
                        </PrimaryButton>
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
            {appStage === "welcome" && <WelcomeModal open={showWelcomeModal} onClose={handleWelcomeModalClose} />}
            {toast && (
                <div className="absolute top-5 left-0 right-0 z-50 w-fit mx-auto">
                    <p className={clsx("mx-4 text-sm font-semibold py-2 px-6 rounded-sm leading-relaxed tracking-wide", toast.type === "error" ? "bg-red-600" : "bg-green-600")}>
                        {toast.message}
                    </p>
                </div>
            )}
            {renderAppContent()}
        </div>
    );
}
