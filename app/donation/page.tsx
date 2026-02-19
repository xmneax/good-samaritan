"use client";

import React, { useState } from "react";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "@/app/donation/actions";
import { Toast } from "@/components/PiAppClient";
import { onIncompletePaymentFound } from "@/lib/pinetwork/callbacks";
import { signIn } from "@/app/actions";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

const PRESET_AMOUNTS = ["1", "5", "10", "50", "100"];
const MIN_DONATION = 0.01;

const DonationPage = () => {
    const [toast, setToast] = useState<Toast | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState("");

    const parsedAmount = parseFloat(selectedAmount);
    const isValidAmount = !isNaN(parsedAmount) && parsedAmount >= MIN_DONATION;

    const paymentData = {
        amount: parsedAmount,
        memo: "Donate to Good Samaritan",
        metadata: { memo: "Donate to Good Samaritan" },
    };

    const callbacks = {
        onReadyForServerApproval,
        onReadyForServerCompletion,
        onCancel,
        onError,
    };

    const handleDonate = async () => {
        if (!isValidAmount) {
            return setToast({ type: "error", message: `Minimum donation is ${MIN_DONATION} Pi.` });
        }

        setIsLoading(true);
        const scopes = ["username", "payments"];

        try {
            const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Login request timed out. Please try again using the Pi Browser.")), 15000));

            const { accessToken } = await Promise.race([window.Pi.authenticate(scopes, onIncompletePaymentFound), timeout]);

            const response = await signIn(accessToken);

            if (!response.success) {
                return setToast({ type: "error", message: response.message });
            }

            await window.Pi.createPayment(paymentData, callbacks);
        } catch (error: any) {
            setToast({ type: "error", message: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
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

            <div className="max-w-md mx-auto p-6 flex flex-col gap-6">
                <div className="bg-white rounded-2xl shadow-xl shadow-violet-100/50 p-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Donation</h2>
                    <p className="text-gray-600 text-sm leading-relaxed">Your donation helps pioneers unlock their Pi and keeps our service free for everyone.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-violet-100/50 p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">Select Amount</label>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {PRESET_AMOUNTS.map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => setSelectedAmount(amount)}
                                    className={clsx(
                                        "py-3 px-4 text-sm rounded-xl border-2 transition-all font-semibold",
                                        selectedAmount === amount
                                            ? "border-violet-400 bg-violet-50 text-violet-700 shadow-sm"
                                            : "border-violet-100 text-gray-700 hover:border-violet-200 hover:bg-violet-50/50"
                                    )}>
                                    {amount} Pi
                                </button>
                            ))}
                        </div>

                        <input
                            type="text"
                            inputMode="decimal"
                            value={selectedAmount}
                            onChange={(e) => {
                                let value = e.target.value.replace(/[^0-9.]/g, "");

                                const parts = value.split(".");
                                if (parts.length > 2) value = `${parts[0]}.${parts[1]}`;

                                setSelectedAmount(value);
                            }}
                            placeholder="Enter custom amount (Pi)"
                            className={clsx(
                                "w-full py-3 px-4 border-2 rounded-xl text-center text-sm font-semibold focus:ring-2 focus:ring-violet-100 focus:outline-none transition-colors",
                                isValidAmount
                                    ? "border-violet-100 text-gray-800 focus:border-violet-300"
                                    : "border-rose-300 text-rose-600 focus:border-rose-400"
                            )}
                        />
                        {!isValidAmount && selectedAmount && (
                            <p className="text-sm text-rose-500 mt-2">Minimum donation is {MIN_DONATION} Pi</p>
                        )}
                    </div>

                    <PrimaryButton
                        onClick={handleDonate}
                        disabled={!isValidAmount || isLoading}
                        className="flex justify-center items-center gap-x-2">
                        {isLoading && <Loader2 size={20} className="animate-spin" />}
                        {isLoading ? "Donating..." : "Donate"}
                    </PrimaryButton>
                </div>
            </div>
        </>
    );
};

export default DonationPage;
