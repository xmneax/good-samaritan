import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import Link from "next/link";
import React from "react";

export default function Ecosystem() {
    return (
        <div className="mx-auto w-full max-w-md flex flex-col justify-center items-center gap-6 p-6">
            <div className="flex flex-col items-center gap-y-2 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Explore the Ecosystem</h1>
                <p className="text-gray-600">Discover more apps by boostr.space</p>
            </div>

            <div className="w-full bg-white rounded-2xl shadow-xl shadow-violet-100/50 p-6 flex flex-col items-center gap-y-4">
                <h2 className="font-bold text-xl text-gray-800">🚀 Boostr.space</h2>
                <p className="text-center text-gray-600 text-sm">Buy Gift cards, Mobile Reload, Utility Payment and eSIM</p>
                <p className="text-center text-gray-600 text-sm">Spend your Pi without worrying about exchanges or taxes!</p>
                <SecondaryButton className="border-none !bg-violet-50 !text-violet-700 !border-violet-200 hover:!bg-violet-100">
                    <a href={process.env.NEXT_PUBLIC_PINET_URL} target="_blank" rel="noreferrer" className="block">
                        Explore Boostr
                    </a>
                </SecondaryButton>
            </div>

            <div className="w-full bg-white rounded-2xl shadow-xl shadow-violet-100/50 p-6 flex flex-col items-center gap-y-4">
                <h2 className="font-bold text-xl text-gray-800">Feeling grateful?</h2>
                <p className="text-center text-gray-600 text-sm">Help us keep this service free for all pioneers</p>
                <PrimaryButton>
                    <Link href="/donation" className="block">Donate</Link>
                </PrimaryButton>
            </div>
        </div>
    );
}
