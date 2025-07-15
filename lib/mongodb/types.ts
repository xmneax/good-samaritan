export interface User {
    uid: string;
    username: string;
    wallet?: string;
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
