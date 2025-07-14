import React, { useState, useEffect } from "react";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";

type AdsSectionProps = {
    setAppStage: (stage: string) => void;
};

const LoadingSpinner = () => (
    <div className="flex items-center justify-center space-x-2 text-white">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        <span className="text-sm">Loading ads...</span>
    </div>
);

export const AdsSection = ({ setAppStage }: AdsSectionProps) => {
    const [adView, setAdView] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        // Simulate loading time (2 seconds)
        const loadingTimer = setTimeout(() => {
            setIsLoading(false);
            setAdView(true);
        }, 2000);

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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="relative flex-1 max-h-screen max-w-screen overflow-hidden">
            {/* Floating Loading Indicator */}
            {isLoading && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-70 px-4 py-2 rounded-full">
                    <LoadingSpinner />
                </div>
            )}

            {/* Floating Timer */}
            {!isLoading && adView && timeLeft > 0 && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-70 px-4 py-2 rounded-full">
                    <div className="flex items-center space-x-2 text-white">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-mono">{formatTime(timeLeft)}</span>
                    </div>
                </div>
            )}

            {/* Ads Content */}
            <div className="h-full bg-[rgba(255,255,255,0.2)] flex items-center justify-center">
                {isLoading ? (
                    <div className="text-center text-gray-600">
                        <div className="text-lg">Preparing your ads...</div>
                    </div>
                ) : (
                    <div className="text-center text-gray-800">
                        <div className="text-2xl font-bold mb-4">Advertisement</div>
                        <div className="text-lg">Your ad content would appear here</div>
                        {timeLeft > 0 && <div className="mt-4 text-sm text-gray-600">Please wait {timeLeft} seconds before continuing</div>}
                    </div>
                )}
            </div>

            {/* Continue Button */}
            {timeLeft === 0 && (
                <div className="absolute bottom-4 left-0 right-0">
                    <PrimaryButton onClick={() => setAppStage("success")} disabled={timeLeft > 0}>
                        {timeLeft > 0 ? `Continue (${timeLeft}s)` : "Continue"}
                    </PrimaryButton>
                </div>
            )}
        </div>
    );
};
