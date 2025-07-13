export default function Terms() {
    return (
        <main className="max-w-md mx-auto p-4 text-sm leading-relaxed">
            <h1 className="text-2xl font-semibold mb-4">Terms of Use</h1>
            <p>
                <strong>Effective Date:</strong> 13 July 2025
            </p>

            <h2 className="mt-4 font-semibold">1. Purpose</h2>
            <p>This app provides small Pi token transfers to help users complete wallet movements blocked due to low balance.</p>

            <h2 className="mt-4 font-semibold">2. Eligibility</h2>
            <ul className="list-disc list-inside">
                <li>Login via valid Pi account.</li>
                <li>Wallet must match the authenticated Pi account.</li>
                <li>Limit: once every 60 days per wallet.</li>
            </ul>

            <h2 className="mt-4 font-semibold">3. Use of Ads</h2>
            <p>You must watch the ad completely. Skipping or exiting cancels the transaction.</p>

            <h2 className="mt-4 font-semibold">4. Abuse Prevention</h2>
            <p>Attempts to cheat, automate, or fake access will result in bans.</p>

            <h2 className="mt-4 font-semibold">5. Donations</h2>
            <p>You may donate Pi after your issue is resolved. It&#39;s optional and appreciated.</p>

            <h2 className="mt-4 font-semibold">6. No Guarantees</h2>
            <p>We do not guarantee availability or success of the transaction.</p>

            <h2 className="mt-4 font-semibold">7. Liability</h2>
            <p>We are not liable for losses caused by bugs, misuse, or third-party issues.</p>
        </main>
    );
}
