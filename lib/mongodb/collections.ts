import { Db } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { User, Transaction, Donation } from "@/lib/mongodb/types";

/** Ensures at most one pending/processing claim per wallet (prevents double-claim race). */
export async function ensureTransactionIndexes() {
    const client = await connectToDatabase();
    const db: Db = client.db();
    const coll = db.collection<Transaction>("transactions");
    await coll.createIndex(
        { recipientWallet: 1 },
        {
            unique: true,
            partialFilterExpression: { status: { $in: ["pending", "processing"] } },
        }
    );
}

export async function getCollections() {
    const client = await connectToDatabase();
    const db: Db = client.db();

    return {
        userCollection: db.collection<User>("users"),
        donationCollection: db.collection<Donation>("donations"),
        transactionCollection: db.collection<Transaction>("transactions"),
    };
}
