import { Check } from "lucide-react";
import React from "react";
import Link from "next/link";

const Success = () => {
    return (
        <div className="flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-xl shadow-violet-100/50 p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200/50">
                    <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Thank You!</h2>
                <p className="text-gray-600 mb-6">Your generous donation is very much appreciated.</p>
                <Link
                    href="/"
                    className="block w-full bg-violet-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-violet-600 transition-colors shadow-sm shadow-violet-200/50">
                    Home
                </Link>
            </div>
        </div>
    );
};

export default Success;
