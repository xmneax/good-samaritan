import PiAppClient from "@/components/PiAppClient";

export default function Home() {
    return (
        <>
            {process.env.NODE_ENV !== "production" && <div className="absolute top-0 left-0 p-1">Testnet</div>}
            <PiAppClient />
        </>
    );
}
