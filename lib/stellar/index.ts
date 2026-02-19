"use server";

import { Asset, Horizon, Keypair, Memo, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import { getCollections, ensureTransactionIndexes } from "@/lib/mongodb/collections";
import { subMinutes } from "date-fns";

const HORIZON_SERVER = "https://api.mainnet.minepi.com";
const NETWORK_PASSPHRASE = "Pi Network";
const BASE_FEE = "1000000"; // must be a string
const SECRET_KEY = process.env.PI_WALLET_PRIVATE_SEED!;

if (!SECRET_KEY) throw new Error("SECRET_KEY must be defined in the environment.");

const server = new Horizon.Server(HORIZON_SERVER);
const sourceKeypair = Keypair.fromSecret(SECRET_KEY);

const isValidWalletAddress = (key: string): boolean => {
    try {
        Keypair.fromPublicKey(key);
        return true;
    } catch {
        return false;
    }
};

/** Canonical form for DB storage and lookup; Stellar addresses are case-insensitive. */
function normalizeRecipientWallet(addr: string): string {
    return addr.trim().toUpperCase();
}

/** Known whitelisted address – always allowed even if env is missing. */
const ALWAYS_WHITELISTED = "GCFIIYT7GM3GGQOJ2OEMJSFO24WZJPBXNUEW7HGWU2U4OHFO7E5L6YTV";

/** Comma-separated env PI_WHITELISTED_WALLETS; whitelisted addresses bypass once-ever and blocklist. */
function getWhitelistedWallets(): string[] {
    const raw = process.env.PI_WHITELISTED_WALLETS ?? "";
    const fromEnv = raw
        .split(",")
        .map((w) => w.trim().toUpperCase())
        .filter(Boolean);
    return fromEnv.includes(ALWAYS_WHITELISTED) ? fromEnv : [ALWAYS_WHITELISTED, ...fromEnv];
}

/** Normalize for whitelist comparison (0 vs O lookalike). */
function normalizeForWhitelist(addr: string): string {
    return addr.trim().toUpperCase().replace(/0/g, "O");
}

function isWalletWhitelisted(normalizedWallet: string): boolean {
    const list = getWhitelistedWallets();
    const normalized = normalizeForWhitelist(normalizedWallet);
    return list.some((w) => normalizeForWhitelist(w) === normalized || w === normalizedWallet);
}

/** Comma-separated env PI_BLOCKED_WALLETS; blocked addresses are never allowed to claim. */
function getBlockedWallets(): string[] {
    const raw = process.env.PI_BLOCKED_WALLETS ?? "";
    return raw
        .split(",")
        .map((w) => w.trim().toUpperCase())
        .filter(Boolean);
}

function isWalletBlocked(normalizedWallet: string): boolean {
    return getBlockedWallets().includes(normalizedWallet);
}

/** Map Stellar/Horizon error codes to user-friendly messages. */
function getStellarErrorMessage(raw: string): string {
    const lower = raw.toLowerCase();
    if (lower.includes("op_underfunded") || lower.includes("op_low_reserve")) {
        return "The faucet is temporarily low on funds. Please try again later.";
    }
    if (lower.includes("op_no_destination") || lower.includes("op_no_account")) {
        return "This address doesn't exist on the Pi Network yet. Use your mainnet wallet from the Pi app.";
    }
    if (lower.includes("tx_bad_auth") || lower.includes("tx_bad_seq")) {
        return "Transaction failed. Please try again.";
    }
    if (lower.includes("tx_insufficient_fee")) {
        return "Transaction failed. Please try again.";
    }
    if (lower.includes("timeout") || lower.includes("etimedout") || lower.includes("econnrefused") || lower.includes("network") || lower.includes("fetch failed")) {
        return "Connection error. Please check your network and try again.";
    }
    return "Transaction failed. Please try again.";
}

/** Map generic errors (DB, network) to user-friendly messages. */
function getGenericErrorMessage(err: unknown): string {
    const msg = err instanceof Error ? err.message : String(err);
    const lower = msg.toLowerCase();
    if (lower.includes("econnrefused") || lower.includes("etimedout") || lower.includes("enotfound") || lower.includes("network") || lower.includes("fetch failed")) {
        return "Connection error. Please check your network and try again.";
    }
    if (lower.includes("mongo") || lower.includes("database")) {
        return "Database error. Please try again later.";
    }
    return "Something went wrong. Please try again later.";
}

export async function checkWalletAddress(
    walletAddress: string,
    options?: { piUid?: string; piWalletAddress?: string }
) {
    if (!walletAddress) {
        return {
            success: false,
            message: "Wallet address is required",
        };
    }

    if (!isValidWalletAddress(walletAddress)) {
        return {
            success: false,
            message: "Invalid wallet address",
        };
    }

    const { piUid, piWalletAddress } = options ?? {};
    if (piWalletAddress && walletAddress.trim().toUpperCase() !== piWalletAddress.trim().toUpperCase()) {
        return {
            success: false,
            message: "Wallet address must match your Pi account wallet.",
        };
    }

    const normalizedWallet = normalizeRecipientWallet(walletAddress);
    const isWhitelisted = isWalletWhitelisted(normalizedWallet);

    if (!isWhitelisted && isWalletBlocked(normalizedWallet)) {
        return {
            success: false,
            message: "This wallet is not eligible to claim.",
        };
    }

    try {
        const { transactionCollection } = await getCollections();
        await ensureTransactionIndexes();

        if (piUid && !isWhitelisted) {
            const existingByUid = await transactionCollection.findOne({ piUid, status: "completed" });
            if (existingByUid) {
                return {
                    success: false,
                    message: "You've already claimed your Pi. Each Pi account can only claim once.",
                };
            }
        }

        const walletQuery = { recipientWallet: { $regex: new RegExp(`^${normalizedWallet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } };
        const existingByWallet = await transactionCollection
            .find(walletQuery)
            .sort({ createdAt: -1 })
            .limit(1)
            .next();

        if (existingByWallet) {
            const status = existingByWallet.status ?? "completed";
            const isPendingOrProcessing = ["pending", "processing"].includes(status);

            if (isPendingOrProcessing) {
                const createdAt = new Date(existingByWallet.createdAt);
                const abandonedThreshold = subMinutes(new Date(), 10);
                const isAbandoned = createdAt < abandonedThreshold || isWhitelisted;
                if (isAbandoned) {
                    await transactionCollection.updateOne(
                        { _id: existingByWallet._id },
                        { $set: { status: "failed" } }
                    );
                } else {
                    return {
                        success: false,
                        message: "A claim for this wallet is already in progress. Please wait or use a different wallet.",
                    };
                }
            } else {
                const hasEverCompleted = status === "completed" || !existingByWallet.status;
                if (!isWhitelisted && hasEverCompleted) {
                    return {
                        success: false,
                        message: "This wallet has already received the faucet. Each wallet can only claim 0.01 Pi once.",
                    };
                }
            }
        }

        const insertPending = () =>
            transactionCollection.insertOne({
                recipientWallet: normalizedWallet,
                amount: 0.01,
                status: "pending",
                ...(piUid && { piUid }),
                createdAt: new Date(),
            });

        try {
            await insertPending();
        } catch (err: unknown) {
            if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
                if (isWhitelisted) {
                    await transactionCollection.updateMany(
                        { recipientWallet: normalizedWallet, status: { $in: ["pending", "processing"] } },
                        { $set: { status: "failed" } }
                    );
                    try {
                        await insertPending();
                    } catch (retryErr: unknown) {
                        if (
                            retryErr &&
                            typeof retryErr === "object" &&
                            "code" in retryErr &&
                            (retryErr as { code: number }).code === 11000
                        ) {
                            return {
                                success: false,
                                message: "A claim for this wallet is already in progress. Please wait or use a different wallet.",
                            };
                        }
                        throw retryErr;
                    }
                } else {
                    return {
                        success: false,
                        message: "A claim for this wallet is already in progress. Please wait or use a different wallet.",
                    };
                }
            } else {
                throw err;
            }
        }
    } catch (err: unknown) {
        return {
            success: false,
            message: getGenericErrorMessage(err),
        };
    }

    try {
        await server.loadAccount(walletAddress);
    } catch {
        try {
            const { transactionCollection } = await getCollections();
            await transactionCollection.deleteOne({ recipientWallet: normalizedWallet, status: "pending" });
        } catch {
            /* ignore rollback error */
        }
        return {
            success: false,
            message: "This address doesn't exist on the Pi Network yet. Use your mainnet wallet from the Pi app.",
        };
    }

    return {
        success: true,
        message: "",
    };
}

export async function createTransaction(walletAddress: string, piUid?: string) {
    const normalizedWallet = normalizeRecipientWallet(walletAddress);
    const { transactionCollection } = await getCollections();

    const claimed = await transactionCollection.findOneAndUpdate(
        { recipientWallet: normalizedWallet, status: "pending" },
        { $set: { status: "processing" } }
    );

    if (!claimed) {
        return {
            success: false,
            message: "No pending claim for this wallet. Please start from the beginning.",
        };
    }

    const amountToSend = "0.01";
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

    const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
        memo: Memo.text("Good Samaritan"),
    })
        .addOperation(
            Operation.payment({
                destination: normalizedWallet,
                asset: Asset.native(),
                amount: amountToSend,
            })
        )
        .setTimeout(30)
        .build();

    transaction.sign(sourceKeypair);

    try {
        const result = await server.submitTransaction(transaction);

        await transactionCollection.updateOne(
            { recipientWallet: normalizedWallet, status: "processing" },
            {
                $set: {
                    status: "completed",
                    successful: result.successful,
                    link: (result as { _links?: { transaction?: { href?: string } } })?._links?.transaction?.href ?? "",
                    ...(piUid && { piUid }),
                },
            }
        );

        return {
            success: true,
            message: "",
        };
    } catch (error: unknown) {
        await transactionCollection.updateOne(
            { recipientWallet: normalizedWallet, status: "processing" },
            { $set: { status: "pending" } }
        );
        let rawMessage: string;
        if (error && typeof error === "object" && "response" in error) {
            const resultCodes = (error as { response?: { data?: { extras?: { result_codes?: string } } } }).response?.data?.extras?.result_codes;
            rawMessage = resultCodes ? String(resultCodes) : (error instanceof Error ? error.message : "Unexpected error occurred");
        } else {
            rawMessage = error instanceof Error ? error.message : "Unexpected error occurred";
        }
        const message = getStellarErrorMessage(rawMessage);
        return {
            success: false,
            message,
        };
    }
}
