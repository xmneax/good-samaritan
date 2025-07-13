import { getCollections } from "@/lib/mongodb/collections";
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/access-token";

export async function POST(request: NextRequest) {
    try {
        const { accessToken } = await request.json();

        if (!accessToken) {
            return NextResponse.json({ error: "Token is required" }, { status: 400, statusText: "Token is required" });
        }

        const { userCollection } = await getCollections();

        const verifiedUser = await verifyAccessToken(accessToken);
        if (!verifiedUser) {
            return NextResponse.json(
                { error: "Invalid access token" },
                { status: 401, statusText: "Invalid access token" }
            );
        }

        const { uid, credentials, username } = verifiedUser;
        const { valid_until } = credentials;

        const updatedUser = await userCollection.findOneAndUpdate(
            { uid },
            {
                $set: {
                    username,
                    lastLogin: new Date(),
                },
                $setOnInsert: {
                    email: "",
                    phoneNumber: "",
                    isBanned: false,
                },
            },
            { upsert: true, returnDocument: "after" }
        );

        if (updatedUser.isBanned) {
            return NextResponse.json({ error: "Not allowed" }, { status: 401, statusText: "Not allowed" });
        }

        return NextResponse.json(
            {
                uid,
                username,
                accessToken,
                validity: valid_until,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber,
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, statusText: error?.message || error || "Internal server error" }
        );
    }
}
