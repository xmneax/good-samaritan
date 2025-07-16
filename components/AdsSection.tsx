import React, { useState, useEffect } from "react";
import { createTransaction } from "@/lib/stellar";
import Image from "next/image";

type AdsSectionProps = {
    walletAddress: string;
    setAppStage: (stage: string) => void;
    setToast: (toast: { type: "success" | "error"; message: string }) => void;
};

const LoadingSpinner = () => (
    <div className="flex items-center justify-center space-x-2 text-white">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        <span className="text-sm">Loading ads...</span>
    </div>
);

const TimerWithProgress = ({ timeLeft, totalTime }: { timeLeft: number; totalTime: number }) => {
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    return (
        <div className="flex items-center space-x-3 text-white opacity-50">
            {/* Progress Bar */}
            <div className="flex-1 h-2 bg-gray-600 bg-opacity-50 rounded-full overflow-hidden mx-2">
                <div className="h-full bg-red-500 transition-all duration-1000 ease-linear rounded-full" style={{ width: `${progress}%` }} />
            </div>

            {/* Countdown Display */}
            <div className="w-6 h-6 bg-gray-800 bg-opacity-80 flex justify-center items-center rounded-full flex-shrink-0">
                <span className="text-xs font-mono font-bold">{timeLeft}</span>
            </div>
        </div>
    );
};

export const AdsSection = ({ walletAddress, setAppStage, setToast }: AdsSectionProps) => {
    const [adView, setAdView] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
    const totalTime = 30;

    const handleCreateTransaction = async () => {
        if (!walletAddress) return;

        setIsProcessingTransaction(true);

        try {
            const { success, message } = await createTransaction(walletAddress);

            if (!success) {
                setToast({ type: "error", message });

                return setAppStage("error");
            }

            setAppStage("success");
        } catch (error) {
            console.error("Transaction failed:", error);
            setAppStage("error");
        } finally {
            setIsProcessingTransaction(false);
        }
    };

    useEffect(() => {
        // Simulate loading time (2 seconds)
        const loadingTimer = setTimeout(() => {
            setIsLoading(false);
            setAdView(true);
        }, 1000);

        return () => clearTimeout(loadingTimer);
    }, []);

    useEffect(() => {
        if (!isLoading && adView && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isLoading, adView, timeLeft]);

    // Auto-trigger transaction when the timer reaches 0
    useEffect(() => {
        if (timeLeft === 0 && !isProcessingTransaction) {
            void handleCreateTransaction();
        }
    }, [timeLeft, isProcessingTransaction]);

    return (
        <div className="fixed inset-0 z-50 bg-[linear-gradient(135deg,#f093fb_0%,#f5576c_100%)] w-screen h-screen flex flex-col overflow-hidden">
            {/* Floating Loading Indicator */}
            {isLoading && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-70 px-4 py-2 rounded-full">
                    <LoadingSpinner />
                </div>
            )}

            {/* Floating Timer with Progress */}
            {!isLoading && adView && timeLeft > 0 && (
                <div className="z-50 p-2">
                    {timeLeft > 0 && <div className="mx-2 text-sm text-gray-600">Please wait {timeLeft} seconds before continuing</div>}
                    <TimerWithProgress timeLeft={timeLeft} totalTime={totalTime} />
                </div>
            )}

            {/* Ads Content */}
            <div className="h-full bg-[rgba(255,255,255,0.2)] flex items-center justify-center">
                {isLoading ? (
                    <div className="text-center text-gray-600">
                        <div className="text-lg">Preparing your ads...</div>
                    </div>
                ) : isProcessingTransaction ? (
                    <div className="text-center text-gray-800">
                        <p className="text-2xl font-bold mb-4">Processing Transaction</p>
                        <p>Sending Pi to your wallet. Please hold...</p>
                    </div>
                ) : /*                    <div className="text-center text-gray-800">
                        <div className="text-2xl font-bold mb-4">Advertisement</div>
                        <div className="text-lg">Your ad content would appear here</div>
                        {timeLeft > 0 && <div className="mt-4 text-sm text-gray-600">Please wait {timeLeft} seconds before continuing</div>}
                        {timeLeft === 0 && !isProcessingTransaction && <div className="mt-4 text-sm text-gray-600">Automatically proceeding...</div>}
                    </div>*/

                timeLeft === 0 && !isProcessingTransaction ? (
                    <div className="mt-4 text-sm text-gray-600">Automatically proceeding...</div>
                ) : (
                    <div onClick={handleCreateTransaction} className="relative w-full h-full">
                        <a href="https://boostr.space">
                            <Image src="/boostr_banner.webp" alt="visit boostr.space on Pi browser" fill />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};
