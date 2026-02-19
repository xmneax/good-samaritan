/**
 * Migration: normalize recipientWallet to uppercase in all transactions.
 * Run with: node --env-file=.env.local scripts/migrate-recipient-wallet-normalize.mjs
 *
 * Stellar addresses are case-insensitive; normalizing ensures the once-ever
 * limit works correctly regardless of input casing.
 */

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error("MONGODB_URI must be set. Run with: node --env-file=.env.local scripts/migrate-recipient-wallet-normalize.mjs");
    process.exit(1);
}

const client = await MongoClient.connect(uri);
const db = client.db();
const coll = db.collection("transactions");

const cursor = coll.find({ recipientWallet: { $exists: true } });
let updated = 0;
let skipped = 0;

for await (const doc of cursor) {
    const current = doc.recipientWallet;
    const normalized = (typeof current === "string" ? current : String(current)).trim().toUpperCase();
    if (current !== normalized) {
        await coll.updateOne({ _id: doc._id }, { $set: { recipientWallet: normalized } });
        updated++;
    } else {
        skipped++;
    }
}

console.log(`Migration complete. Updated: ${updated}, already normalized: ${skipped}`);
await client.close();
