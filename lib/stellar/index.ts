"use server";

import { Asset, Horizon, Keypair, Memo, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import { getCollections, ensureTransactionIndexes } from "@/lib/mongodb/collections";
import { isAfter, subDays, subMinutes } from "date-fns";

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

/** Known whitelisted address – always allowed even if env is missing. */
const ALWAYS_WHITELISTED = "GCFIIYT7GM3GGQOJ2OEMJSFO24WZJPBXNUEW7HGWU2U4OHFO7E5L6YTV";

/** Comma-separated env PI_WHITELISTED_WALLETS; whitelisted addresses bypass 14-day and balance checks. */
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

/** Pi mainnet native asset = available balance. Returns whether wallet has < 0.01 π (needs faucet). */
export async function getWalletNeedsFaucet(walletAddress: string): Promise<{
    success: boolean;
    message?: string;
    availableBalance?: number;
    needsFaucet?: boolean;
}> {
    if (!walletAddress || !isValidWalletAddress(walletAddress)) {
        return { success: false, message: "Invalid wallet address" };
    }
    try {
        const account = await server.loadAccount(walletAddress);
        const nativeBalanceLine = account.balances.find((b) => b.asset_type === "native");
        const balanceStr = nativeBalanceLine?.balance ?? "0";
        const availableBalance = parseFloat(balanceStr);
        const needsFaucet = availableBalance < 0.01;
        return {
            success: true,
            availableBalance,
            needsFaucet,
        };
    } catch {
        return {
            success: false,
            message: "Wallet address not found on the Stellar network",
        };
    }
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
    if (piWalletAddress && walletAddress !== piWalletAddress) {
        return {
            success: false,
            message: "Wallet address must match your Pi account wallet.",
        };
    }

    const normalizedWallet = walletAddress.trim().toUpperCase();
    const isWhitelisted = isWalletWhitelisted(normalizedWallet);

    try {
        const { transactionCollection } = await getCollections();
        await ensureTransactionIndexes();

        const fourteenDaysAgo = subDays(new Date(), 14);

        if (piUid && !isWhitelisted) {
            const existingByUid = await transactionCollection
                .find({ piUid, status: "completed" })
                .sort({ createdAt: -1 })
                .limit(1)
                .next();
            if (existingByUid) {
                const createdAt = new Date(existingByUid.createdAt!);
                if (isAfter(createdAt, fourteenDaysAgo)) {
                    return {
                        success: false,
                        message: "You've already claimed your Pi. You can only claim once per Pi account every 14 days.",
                    };
                }
            }
        }

        const existingByWallet = await transactionCollection
            .find({
                $or: [
                    { recipientWallet: walletAddress },
                    { recipientWallet: normalizedWallet },
                    { recipientWallet: normalizedWallet.toLowerCase() },
                ],
            })
            .sort({ createdAt: -1 })
            .limit(1)
            .next();

        if (existingByWallet) {
            const status = existingByWallet.status ?? "completed";
            const createdAt = new Date(existingByWallet.createdAt);
            const isPendingOrProcessing = ["pending", "processing"].includes(status);
            const isCompletedWithin14Days = (status === "completed" || !existingByWallet.status) && isAfter(createdAt, fourteenDaysAgo);

            if (isPendingOrProcessing) {
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
            }
            if (!isWhitelisted && isCompletedWithin14Days) {
                return {
                    success: false,
                    message: "You've already claimed your Pi. You can only claim once every 14 days.",
                };
            }
        }

        const insertPending = () =>
            transactionCollection.insertOne({
                recipientWallet: walletAddress,
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
                        {
                            $or: [
                                { recipientWallet: walletAddress },
                                { recipientWallet: normalizedWallet },
                                { recipientWallet: normalizedWallet.toLowerCase() },
                            ],
                            status: { $in: ["pending", "processing"] },
                        },
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
            message: err instanceof Error ? err.message : "Unexpected db error",
        };
    }

    if (!isWhitelisted) {
        const needsCheck = await getWalletNeedsFaucet(walletAddress);
        if (!needsCheck.success) {
            return {
                success: false,
                message: needsCheck.message ?? "Wallet address not found on the Stellar network",
            };
        }
        if (!needsCheck.needsFaucet) {
            const balance = needsCheck.availableBalance ?? 0;
            return {
                success: false,
                message: `Your wallet already has enough available balance (${balance.toFixed(2)} π). The faucet is only for pioneers who have less than 0.01 π available.`,
            };
        }
    }

    try {
        await server.loadAccount(walletAddress);
    } catch {
        try {
            const { transactionCollection } = await getCollections();
            await transactionCollection.deleteOne({ recipientWallet: walletAddress, status: "pending" });
        } catch {
            /* ignore rollback error */
        }
        return {
            success: false,
            message: "Wallet address not found on the Stellar network",
        };
    }

    return {
        success: true,
        message: "",
    };
}

export async function createTransaction(walletAddress: string, piUid?: string) {
    const { transactionCollection } = await getCollections();

    const claimed = await transactionCollection.findOneAndUpdate(
        { recipientWallet: walletAddress, status: "pending" },
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
                destination: walletAddress,
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
            { recipientWallet: walletAddress, status: "processing" },
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
            { recipientWallet: walletAddress, status: "processing" },
            { $set: { status: "pending" } }
        );
        const message =
            error && typeof error === "object" && "response" in error
                ? String(
                      (error as { response?: { data?: { extras?: { result_codes?: string } } } }).response?.data?.extras?.result_codes ??
                          (error instanceof Error ? error.message : "Unexpected error occurred")
                  )
                : error instanceof Error
                  ? error.message
                  : "Unexpected error occurred";
        return {
            success: false,
            message,
        };
    }
}
