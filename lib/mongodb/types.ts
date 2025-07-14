import { ObjectId } from "mongodb";

export interface User {
    uid: string;
    username: string;
    wallet?: string;
}

export interface BaseTransaction extends User {
    amount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Transaction extends BaseTransaction {
    _id: ObjectId;
}
