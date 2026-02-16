import React, { useState, useEffect } from "react";
import { createTransaction } from "@/lib/stellar";
import Image from "next/image";

type AdsSectionProps = {
    walletAddress: string;
    piUid?: string;
    setAppStage: (stage: string) => void;
    setToast: (toast: { type: "success" | "error"; message: string }) => void;
};

const LoadingSpinner = () => (
    <div className="flex items-center justify-center space-x-2 text-gray-700">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-300 border-t-violet-600" />
        <span className="text-sm font-medium">Loading ads...</span>
    </div>
);

const TimerWithProgress = ({ timeLeft, totalTime }: { timeLeft: number; totalTime: number }) => {
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    return (
        <div className="flex items-center space-x-3">
            {/* Progress Bar */}
            <div className="flex-1 h-2 bg-violet-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 transition-all duration-1000 ease-linear rounded-full" style={{ width: `${progress}%` }} />
            </div>

            {/* Countdown Display */}
            <div className="w-8 h-8 bg-violet-500 text-white flex justify-center items-center rounded-lg flex-shrink-0 font-mono font-bold text-sm">
                {timeLeft}
            </div>
        </div>
    );
};

export const AdsSection = ({ walletAddress, piUid, setAppStage, setToast }: AdsSectionProps) => {
    const [adView, setAdView] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
    const totalTime = 30;

    const handleCreateTransaction = async () => {
        if (!walletAddress) return;

        setIsProcessingTransaction(true);

        try {
            const { success, message } = await createTransaction(walletAddress, piUid);

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

    // Auto-trigger transaction when the timer reaches 0 (guard: wallet set, not already processing)
    useEffect(() => {
        if (walletAddress && timeLeft === 0 && !isProcessingTransaction) {
            void handleCreateTransaction();
        }
    }, [walletAddress, timeLeft, isProcessingTransaction]);

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
                    {timeLeft > 0 && <div className="mx-2 text-sm text-gray-600">Please wait {timeLeft}s. You’ll still get your Pi if you click the ads below.</div>}
                    <TimerWithProgress timeLeft={timeLeft} totalTime={totalTime} />
                </div>
            )}

            {/* Ads Content: in-app message first; partner link secondary */}
            <div className="h-full bg-[rgba(255,255,255,0.2)] flex flex-col items-center justify-center gap-6 p-4">
                {isLoading ? (
                    <div className="text-center text-gray-600">
                        <div className="text-lg">Preparing your ads...</div>
                    </div>
                ) : isProcessingTransaction ? (
                    <div className="text-center text-gray-800">
                        <p className="text-2xl font-bold mb-4">Processing Transaction</p>
                        <p>Sending Pi to your wallet. Please hold...</p>
                    </div>
                ) : (
                    <>
                        <div className="text-center text-gray-800 max-w-md">
                            <p className="text-xl font-bold mb-2">Thanks for supporting the ecosystem</p>
                            <p className="text-sm">
                                {timeLeft > 0
                                    ? `Please wait ${timeLeft}s. You'll still get your Pi. Optionally visit our partner below.`
                                    : "Sending your 0.01 π now. You can visit our partner below."}
                            </p>
                        </div>
                        {timeLeft > 0 && (
                            <div onClick={handleCreateTransaction} className="relative w-48 h-48 rounded-lg overflow-hidden">
                                <Image src="/vertical-ads.webp" alt="Partner" width={192} height={192} className="object-cover" />
                            </div>
                        )}
                        {process.env.NEXT_PUBLIC_PINET_URL && (
                            <a
                                href={process.env.NEXT_PUBLIC_PINET_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-blue-600 underline"
                            >
                                Visit partner (Boostr.space)
                            </a>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
