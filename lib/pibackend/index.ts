"use server";

import PiNetwork from "pi-backend";
import { PaymentDTO } from "@/globals";
import { getCollections } from "@/lib/mongodb/collections";
import { isAfter, subDays } from "date-fns";

const apiKey = process.env.PI_API_KEY!;
const walletPrivateSeed = process.env.PI_WALLET_PRIVATE_SEED!;

const pi = new PiNetwork(apiKey, walletPrivateSeed);

export const createPayment = async (uid: string) => {
    try {
        /*        const { transactionCollection } = await getCollections();

        // Find transaction by user_uid (based on your sample doc)
        const existingTransaction = await transactionCollection.findOne({
            user_uid: uid,
        });

        // Check if transaction exists and is within 14 days
        if (existingTransaction) {
            const createdAt = new Date(existingTransaction.created_at);
            const fourteenDaysAgo = subDays(new Date(), 14);

            if (isAfter(createdAt, fourteenDaysAgo)) {
                return {
                    success: false,
                    message: "You've already claimed your Pi. You can only claim once every 14 days.",
                };
            }
        }*/

        const paymentData = {
            uid,
            amount: 0.01,
            memo: "Good Samaritan - To Transfer Unlocked Balance",
            metadata: {
                memo: "Good Samaritan - To Transfer Unlocked Balance",
            },
        };

        const paymentId = await pi.createPayment(paymentData);

        const txid = await pi.submitPayment(paymentId);

        const completedPayment = await pi.completePayment(paymentId, txid);
        console.log(completedPayment);
        //await transactionCollection.insertOne(completedPayment);

        return {
            success: true,
            message: "Pi sent to the user's wallet",
        };
    } catch (err: any) {
        console.error("Payment creation error:", err);

        return {
            success: false,
            message: err?.message || "Unexpected error occurred",
        };
    }
};

export const handleIncompletePayment = async () => {
    const response = await pi.getIncompleteServerPayments();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const incompletePayment: PaymentDTO = response.incomplete_server_payments[0];

    if (!incompletePayment) return;

    const paymentId = incompletePayment?.identifier;
    const txid = incompletePayment.transaction?.txid;

    if (!incompletePayment.transaction) {
        const cancelledPayment = await pi.cancelPayment(paymentId);

        console.log({ cancelledPayment });

        return {
            success: true,
            message: "Incomplete transaction cancelled",
            data: cancelledPayment,
        };
    }

    const completedPayment = await pi.completePayment(paymentId, txid as string);

    console.log({ completedPayment });

    return {
        success: true,
        message: "Incomplete transaction cancelled",
        data: completedPayment,
    };
};
