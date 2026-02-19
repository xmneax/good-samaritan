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

    const from = typeof data?.user_uid === "string" ? data.user_uid : "";
    const wallet = typeof data?.from_address === "string" ? data.from_address : "";
    const amount = typeof data?.amount === "number" ? data.amount : 0;
    const paymentIdVal = typeof data?.identifier === "string" ? data.identifier : paymentId;
    const link = data?.transaction && typeof data.transaction._link === "string" ? data.transaction._link : "";

    const { donationCollection } = await getCollections();

    await donationCollection.insertOne({
        from,
        wallet,
        amount,
        status: "completed",
        paymentId: paymentIdVal,
        link,
        createdAt: new Date(),
    });

    console.log("Server complete: ", data);

    redirect("/success");
}

export async function onCancel(paymentId: string) {
    console.log(`${paymentId} cancelled`);

    redirect("/");
}

export async function onError(error: any, payment: PaymentDTO) {
    console.log(error);

    redirect("/");
}
