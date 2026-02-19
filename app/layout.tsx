import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { PiScript } from "@/lib/pinetwork/sdk";
import Link from "next/link";
import NextTopLoader from "nextjs-toploader";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Good Samaritan",
    description: "Good Samaritan App for Pi Network",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en">
            <PiScript />
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col justify-between`}>
                <header className="sticky top-0 z-40 w-full backdrop-blur-sm bg-white/80 border-b border-violet-100">
                    <nav className="flex justify-center items-center gap-x-6 sm:gap-x-8 py-4 px-4">
                        <Link href="/" className="text-gray-700 font-semibold py-2 px-3 rounded-lg hover:bg-violet-100/80 hover:text-violet-700 transition-colors">
                            Home
                        </Link>
                        <Link href="/donation" className="text-gray-700 font-semibold py-2 px-3 rounded-lg hover:bg-violet-100/80 hover:text-violet-700 transition-colors">
                            Donate
                        </Link>
                    </nav>
                </header>

                <main className="flex-1 flex min-h-0">{children}</main>

                <footer className="border-t border-violet-100 bg-white/60 backdrop-blur-sm py-4 px-4">
                    <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-sm">
                        <Link href="/privacy" className="text-gray-600 hover:text-violet-600 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-gray-600 hover:text-violet-600 transition-colors">
                            Terms & Conditions
                        </Link>
                        <a href="mailto:support@goodsamaritan.pi" className="text-gray-600 hover:text-violet-600 transition-colors">
                            Help
                        </a>
                    </div>
                </footer>

                <NextTopLoader
                    color="#8b5cf6"
                    initialPosition={0.08}
                    crawlSpeed={200}
                    height={3}
                    crawl={true}
                    showSpinner={true}
                    easing="ease"
                    speed={200}
                    shadow="0 0 10px #c4b5fd,0 0 5px #ddd6fe"
                />
            </body>
        </html>
    );
}
