"use client";

import Script from "next/script";

export const PiScript = () => {
    return (
        <Script
            src="https://sdk.minepi.com/pi-sdk.js"
            strategy="afterInteractive"
            onLoad={() => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                if (window.Pi) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    window.Pi.init({
                        version: "2.0",
                        sandbox: true /*process.env.NODE_ENV !== "production"*/,
                    });
                }
            }}
        />
    );
};
