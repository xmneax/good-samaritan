import { Db } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { User, Transaction, Donation } from "@/lib/mongodb/types";

export async function getCollections() {
    const client = await connectToDatabase();
    const db: Db = client.db();

    return {
        userCollection: db.collection<User>("users"),
        donationCollection: db.collection<Donation>("donations"),
        transactionCollection: db.collection<Transaction>("transactions"),
    };
}
