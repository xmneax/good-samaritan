import { connectToDatabase } from "@/lib/mongodb/connection";
import { User, Transaction } from "@/lib/mongodb/types";
import { Db } from "mongodb";

export async function getCollections() {
    const client = await connectToDatabase();
    const db: Db = client.db();

    return {
        userCollection: db.collection<User>("users"),
        transactionCollection: db.collection<Transaction>("transactions"),
    };
}
