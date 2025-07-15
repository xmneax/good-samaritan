"use client";

import React, { useState } from "react";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "@/app/donation/actions";

const DonationPage = () => {
    const [selectedAmount, setSelectedAmount] = useState("");

    const paymentData = { amount: Number(selectedAmount), memo: "Donate to Good Samaritan", metadata: { memo: "Donate to Good Samaritan" } };
    const callbacks = {
        onReadyForServerApproval,
        onReadyForServerCompletion,
        onCancel,
        onError,
    };

    const handleDonate = async () => {
        await window.Pi.createPayment(paymentData, callbacks);
    };

    return (
        <div className="min-h-screen max-w-md mx-auto p-4 flex flex-col justify-between space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Help Us Help Others</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                    Your donation helps pioneers unlock their Pi and keeps our service free for everyone. Every contribution makes a difference.
                </p>
            </div>

            <div className="flex-1">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    {/* Amount Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Select Amount</label>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {["1", "5", "10", "50", "100"].map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => {
                                        setSelectedAmount(amount);
                                    }}
                                    className={`py-3 px-4 text-sm rounded-lg border transition-colors font-semibold ${
                                        selectedAmount === amount ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-700 hover:border-gray-300"
                                    }`}>
                                    {amount} π
                                </button>
                            ))}
                        </div>

                        {/* Custom Amount */}
                        <div>
                            <input
                                type="text"
                                value={selectedAmount}
                                onChange={(event) => {
                                    let value = event.target.value.replace(/[^0-9]/g, "");

                                    // Prevent leading 0
                                    if (value.startsWith("0")) {
                                        value = value.replace(/^0+/, "");
                                    }

                                    setSelectedAmount(value);
                                }}
                                placeholder="Enter custom amount (π)"
                                className="w-full py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-sm font-semibold text-black"
                            />
                        </div>
                    </div>

                    {/* Donate Button */}
                    <PrimaryButton
                        onClick={handleDonate}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
                        Donate
                    </PrimaryButton>
                </div>
            </div>

            <div className="text-center pb-6">
                <p className="text-xs">
                    Need help? • Contact: <a href="mailto:support@goodsamaritan.pi">support@goodsamaritan.pi</a>
                </p>
            </div>
        </div>
    );
};

export default DonationPage;
