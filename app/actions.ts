"use server";

interface SignInResult<T = unknown> {
    success: boolean;
    message: string;
    data: T | null;
}

export async function signIn(accessToken: string): Promise<SignInResult> {
    try {
        const response = await fetch("https://api.minepi.com/v2/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const user = await response.json();
        const normalized = {
            ...user,
            wallet: user.wallet ?? user.wallet_address ?? undefined,
        };

        return {
            success: true,
            message: "",
            data: normalized,
        };
    } catch (err: any) {
        console.error("Sign-in error:", err);

        return {
            success: false,
            message: err?.message || "Unexpected error occurred",
            data: null,
        };
    }
}
