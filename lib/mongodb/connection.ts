import { MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI;
if (!URI) throw new Error("MongoDB URI is missing from the .env");

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
let cached = global._mongoClient;

export const connectToDatabase = async () => {
    if (!cached) {
        cached = await MongoClient.connect(URI);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        global._mongoClient = cached;
    }
    return cached;
};
