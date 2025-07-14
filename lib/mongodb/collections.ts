import { connectToDatabase } from "@/lib/mongodb/connection";
import { User } from "@/lib/mongodb/types";
import { Db } from "mongodb";
import { PaymentDTO } from "@/globals";

export async function getCollections() {
    const client = await connectToDatabase();
    const db: Db = client.db();

    return {
        userCollection: db.collection<User>("users"),
        transactionCollection: db.collection<PaymentDTO>("transactions"),
    };
}
