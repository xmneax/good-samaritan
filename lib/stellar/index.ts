"use server";

import { Asset, Horizon, Keypair, Memo, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import { getCollections } from "@/lib/mongodb/collections";
import { isAfter, subDays } from "date-fns";

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

export async function checkWalletAddress(walletAddress: string) {
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

    try {
        const { transactionCollection } = await getCollections();
        const existingTransaction = await transactionCollection.findOne({
            recipientWallet: walletAddress,
        });

        if (existingTransaction) {
            const createdAt = new Date(existingTransaction.createdAt);
            const fourteenDaysAgo = subDays(new Date(), 14);

            if (isAfter(createdAt, fourteenDaysAgo)) {
                return {
                    success: false,
                    message: "You've already claimed your Pi. You can only claim once every 14 days.",
                };
            }
        }
    } catch (err: any) {
        return {
            success: false,
            message: err?.message || "Unexpected db error",
        };
    }

    try {
        await server.loadAccount(walletAddress);
    } catch {
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

export async function createTransaction(walletAddress: string) {
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

        const { transactionCollection } = await getCollections();

        await transactionCollection.insertOne({
            amount: Number(amountToSend),
            recipientWallet: walletAddress,
            successful: result.successful,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            link: result?._links?.transaction?.href,
            createdAt: new Date(),
        });

        return {
            success: true,
            message: "",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.extras?.result_codes || error.message || "Unexpected error occurred",
        };
    }
}
