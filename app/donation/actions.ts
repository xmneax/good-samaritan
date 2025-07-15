"use server";

import { PaymentDTO } from "@/globals";
import { getCollections } from "@/lib/mongodb/collections";
import { redirect } from "next/navigation";

export async function onReadyForServerApproval(paymentId: string) {
    const response = await fetch(`${process.env.PI_API_URL}/payments/${paymentId}/approve`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Key ${process.env.PI_API_KEY}`,
        },
    });

    const data = await response.json();

    console.log("Server Approval", data);
    return { success: true };
}

export async function onReadyForServerCompletion(paymentId: string, txid: string) {
    const response = await fetch(`${process.env.PI_API_URL}/payments/${paymentId}/complete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Key ${process.env.PI_API_KEY}`,
        },
        body: JSON.stringify({ txid }),
    });

    const data = await response.json();

    const { donationCollection } = await getCollections();

    await donationCollection.insertOne({
        from: data.user_uid,
        wallet: data.from_address,
        amount: data.amount,
        status: "completed",
        paymentId: data.identifier,
        link: data.transaction._link,
    });

    console.log("Server complete: ", data);

    redirect("/success");
}

export async function onCancel(paymentId: string) {
    console.log(`${paymentId} cancelled`);
}

export async function onError(error: any, payment: PaymentDTO) {
    console.log(error);
}
