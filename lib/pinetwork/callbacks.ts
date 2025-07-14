import { PaymentDTO } from "@/globals";

export const onIncompletePaymentFound = (payment: PaymentDTO) => {
    console.log("onIncompletePaymentFound", payment);
};
