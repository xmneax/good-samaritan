import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { PiScript } from "@/lib/pinetwork/sdk";
import Link from "next/link";

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
                <header className="flex justify-center items-center gap-x-3 p-2">
                    <Link href="/" className="font-semibold p-2 hover:text-blue-500">
                        Home
                    </Link>
                    <Link href="/ecosystem" className="font-semibold p-2 hover:text-blue-500">
                        Ecosystem
                    </Link>

                    <Link href="/donation" className="font-semibold p-2 hover:text-blue-500">
                        Donate
                    </Link>
                </header>

                <main className="flex-1 flex">{children}</main>

                <footer className="flex justify-center items-center gap-x-2 p-2">
                    <Link href="/privacy" className="text-sm p-1">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="text-sm p-1">
                        Terms & Conditions
                    </Link>

                    <a href="mailto:support@goodsamaritan.pi" className="text-sm p-1">
                        Help
                    </a>
                </footer>
            </body>
        </html>
    );
}
