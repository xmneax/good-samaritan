"use server";

import { PaymentDTO } from "@/globals";

export async function onIncompletePaymentFound(payment: PaymentDTO) {
    const { identifier: paymentId, transaction } = payment;
    console.log("TXID", transaction?.txid);

    const response = await fetch(`${process.env.PI_API_URL}/payments/${paymentId}/complete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Key ${process.env.PI_API_KEY}`,
        },
        body: JSON.stringify({ txid: transaction?.txid }),
    });

    const data = await response.json();

    console.log("onIncompletePaymentFound", data);

    return { success: true };
}
