export interface User {
    uid: string;
    username: string;
    wallet?: string;
}

export type TransactionStatus = "pending" | "processing" | "completed" | "failed";

export interface Transaction {
    recipientWallet: string;
    amount: number;
    status: TransactionStatus;
    /** Pi account uid when authenticated; used for one claim per account per 14 days */
    piUid?: string;
    /** Set when status is completed */
    successful?: boolean;
    /** Set when status is completed */
    link?: string;
    createdAt: Date;
}

export interface Donation {
    from: string;
    wallet: string;
    amount: number;
    status: "pending" | "completed" | "cancelled";
    paymentId: string;
    link: string;
    createdAt: Date;
}
