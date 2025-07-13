"use client";

import Image from "next/image";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { useState } from "react";
import { Check, Wallet, X } from "lucide-react";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { clsx } from "clsx";
import WelcomeModal from "@/components/WelcomeModal";

export default function PiAppClient() {
    const [showWelcomeModal, setShowWelcomeModal] = useState(true);
    const [appStage, setAppStage] = useState("welcome"); // welcome, login, walletInput, adView, success, error, ecosystem
    const [walletAddress, setWalletAddress] = useState("");
    const [adView, setAdView] = useState(false);

    const scopes = ["username", "payments", "wallet_address"];

    const handleStage = (stage: string) => setAppStage(stage);

    const handleWelcomeModalClose = () => {
        setShowWelcomeModal(false);
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
                            <h1 className="text-4xl font-bold">Good Samaritan</h1>

                            <p className="text-center font-medium">Need 0.01 Pi to move your lockups? We&#39;ve got you covered!</p>
                        </div>

                        <PrimaryButton onClick={() => handleStage("login")}>Get Started</PrimaryButton>
                    </div>
                );

            case "login":
                return (
                    <div className="w-full max-w-md flex flex-col justify-center items-center gap-y-10 p-4">
                        <div className="flex flex-col items-center gap-y-2">
                            <h1 className="text-4xl font-bold">Login with Pi</h1>

                            <p className="text-center font-medium">Connect your Pi Network account to continue</p>
                        </div>

                        <div className="w-full flex flex-col items-center gap-y-4">
                            <PrimaryButton onClick={() => handleStage("walletInput")}>
                                <div className="flex items-center justify-center gap-2">
                                    <Wallet size={20} />
                                    Login with Pi Network
                                </div>
                            </PrimaryButton>

                            <SecondaryButton onClick={() => handleStage("welcome")}>Back</SecondaryButton>
                        </div>
                    </div>
                );

            case "walletInput":
                return (
                    <div className="w-full max-w-md flex flex-col justify-center items-center gap-y-10 p-4">
                        <div className="flex flex-col items-center gap-y-2">
                            <h1 className="text-4xl font-bold">Wallet Address</h1>
                            <p className="text-center font-medium">Pi Wallet Address</p>
                        </div>

                        <div className="w-full flex flex-col items-center gap-y-4">
                            <PrimaryButton onClick={() => handleStage("adView")}>Confirm Address</PrimaryButton>

                            <SecondaryButton onClick={() => handleStage("welcome")}>Back</SecondaryButton>
                        </div>
                    </div>
                );

            case "adView":
                return (
                    <div className="relative flex-1 max-h-screen max-w-screen overflow-hidden">
                        <div className="h-full bg-[rgba(255,255,255,0.2)]">Ads goes here</div>

                        <div className="absolute bottom-4 left-0 right-0">
                            <PrimaryButton onClick={() => handleStage("success")} disabled={!adView}>
                                Continue
                            </PrimaryButton>
                        </div>
                    </div>
                );

            case "success":
                return (
                    <div className="w-full max-w-md flex flex-col justify-center items-center gap-y-10 p-4">
                        <div className="rounded-full w-18 h-18 flex justify-center items-center bg-green-600">
                            <Check size={40} />
                        </div>

                        <div className="flex flex-col items-center gap-y-2">
                            <h1 className="text-4xl font-bold">Transfer Complete!</h1>
                            <p className="text-center font-medium">0.01 Pi has been sent to your wallet</p>
                        </div>

                        <div className=" w-full h-50 bg-[rgba(255,255,255,0.2)] rounded-xl flex justify-center items-center">Place ads here</div>

                        <PrimaryButton onClick={() => handleStage("ecosystem")}>Continue</PrimaryButton>
                    </div>
                );

            case "error":
                return (
                    <div className="w-full max-w-md flex flex-col justify-center items-center gap-y-10 p-4">
                        <div className="rounded-full w-18 h-18 flex justify-center items-center bg-red-600">
                            <X size={40} />
                        </div>

                        <div className="flex flex-col items-center gap-y-2">
                            <h1 className="text-4xl font-bold">Error Occurred!</h1>
                            <p className="text-center font-medium">The blockchain is busy right now. Please try again!</p>
                        </div>

                        <div className=" w-full h-50 bg-[rgba(255,255,255,0.2)] rounded-xl flex justify-center items-center">Place ads here</div>

                        <PrimaryButton onClick={() => handleStage("welcome")}>Try Again</PrimaryButton>
                    </div>
                );

            case "ecosystem":
                return (
                    <div className="w-full max-w-md flex flex-col justify-center items-center gap-y-8 p-4">
                        <div className="flex flex-col items-center gap-y-2">
                            <h1 className="text-3xl font-bold">Explore the Ecosystem</h1>
                            <p className="text-center font-medium">Discover more apps by boostr.space</p>
                        </div>

                        <div className=" w-full bg-[rgba(255,255,255,0.2)] rounded-xl flex flex-col justify-center items-center gap-y-4 p-4">
                            <h2 className="font-bold text-xl">🚀 Boostr.space</h2>

                            <p className="text-center font-medium">Buy Gift cards, Mobile Reload, Utility Payment and eSIM</p>

                            <p className="text-center font-medium">Spend your Pi without worrying about exchanges or taxes!</p>
                            <SecondaryButton onClick={() => handleStage("ecosystem")} className="border-none">
                                Explore Boostr
                            </SecondaryButton>
                        </div>

                        <div className=" w-full bg-[rgba(255,255,255,0.2)] rounded-xl flex flex-col justify-center items-center gap-y-4 p-4">
                            <h2 className="font-bold text-xl">🛍️ Pi Marketplace</h2>

                            <p className="text-center font-medium">Buy and sell with Pi in a secure marketplace</p>

                            <SecondaryButton className="border-none">Coming Soon</SecondaryButton>
                        </div>

                        <div className=" w-full bg-[rgba(255,255,255,0.2)] rounded-xl flex flex-col justify-center items-center gap-y-4 p-4">
                            <h2 className="font-bold text-xl">Feeling grateful?</h2>

                            <p className="text-center font-medium">Help us keep this service free for all pioneers</p>
                            <PrimaryButton onClick={() => handleStage("ecosystem")}>Donate</PrimaryButton>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <main className={clsx("min-h-screen flex", appStage !== "adView" ? "items-center justify-center" : "p-2")}>
            {appStage === "welcome" && <WelcomeModal open={showWelcomeModal} onClose={handleWelcomeModalClose} />}
            {renderAppContent()}
        </main>
    );
}
