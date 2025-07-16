import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import Link from "next/link";
import React from "react";

export default function Ecosystem() {
    return (
        <div className="mx-auto w-full max-w-md flex flex-col justify-center items-center gap-y-8 p-4">
            <div className="flex flex-col items-center gap-y-2">
                <h1 className="text-2xl font-bold">Explore the Ecosystem</h1>
                <p className="text-center font-medium">Discover more apps by boostr.space</p>
            </div>

            <div className=" w-full bg-[rgba(255,255,255,0.2)] rounded-xl flex flex-col justify-center items-center gap-y-4 p-4">
                <h2 className="font-bold text-xl">🚀 Boostr.space</h2>

                <p className="text-center font-medium">Buy Gift cards, Mobile Reload, Utility Payment and eSIM</p>

                <p className="text-center font-medium">Spend your Pi without worrying about exchanges or taxes!</p>
                <SecondaryButton className="border-none">
                    <a href="https://boostr.space">Explore Boostr</a>
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
                <PrimaryButton>
                    <Link href="/donation">Donate</Link>
                </PrimaryButton>
            </div>
        </div>
    );
}
