// Typically placed in a global types file (e.g., `globals.d.ts` or at the top of your file)

export type PaymentDTO = {
    // Payment data:
    identifier: string; // payment identifier
    user_uid: string; // user's app-specific ID
    amount: number; // payment amount
    memo: string; // a string provided by the developer, shown to the user
    metadata: object; // an object provided by the developer for their own usage
    from_address: string; // sender address of the blockchain transaction
    to_address: string; // recipient address of the blockchain transaction
    direction: Direction; // direction of the payment
    created_at: string; // payment's creation timestamp
    network: AppNetwork; // a network of the payment

    // Status flags representing the current state of this payment
    status: {
        developer_approved: boolean; // Server-Side Approval
        transaction_verified: boolean; // blockchain transaction verified
        developer_completed: boolean; // server-Side Completion
        cancelled: boolean; // cancelled by the developer or by Pi Network
        user_cancelled: boolean; // cancelled by the user
    };

    // Blockchain transaction data:
    transaction: null | {
        // This is null if no transaction has been made yet
        txid: string; // id of the blockchain transaction
        verified: boolean; // true if the transaction matches the payment, false otherwise
        _link: string; // a link to the operation on the Blockchain API
    };
};

declare global {
    interface Window {
        Pi: {
            authenticate: (
                scopes: string[],
                onIncompletePaymentFound: (payment: PaymentDTO) => void
            ) => Promise<{
                accessToken: string;
                user: {
                    uid: string;
                    username: string;
                    //wallet_address: string;
                };
            }>;
        };
    }
}

export {}; // Required to make this a module
