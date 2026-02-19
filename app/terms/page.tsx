export default function Terms() {
    return (
        <main className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-xl shadow-violet-100/50 p-8 text-gray-700 text-sm leading-relaxed">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Terms of Use</h1>
                <p>
                    <strong>Effective Date:</strong> 13 July 2025
                </p>

                <h2 className="mt-6 font-semibold text-gray-800">1. Purpose</h2>
                <p>This app provides small Pi token transfers to help users complete wallet movements blocked due to low balance.</p>

                <h2 className="mt-6 font-semibold text-gray-800">2. Eligibility</h2>
                <ul className="list-disc list-inside">
                    <li>You must log in with a valid Pi account to use the faucet.</li>
                    <li>Wallet address must match your authenticated Pi account when we have it on file.</li>
                    <li>Limit: one claim per Pi account and per wallet, ever.</li>
                </ul>

                <h2 className="mt-6 font-semibold text-gray-800">3. Abuse Prevention</h2>
                <p>Attempts to cheat, automate, or fake access will result in bans.</p>

                <h2 className="mt-6 font-semibold text-gray-800">4. Donations</h2>
                <p>You may donate Pi after your issue is resolved. It&#39;s optional and appreciated.</p>

                <h2 className="mt-6 font-semibold text-gray-800">5. No Guarantees</h2>
                <p>We do not guarantee availability or success of the transaction.</p>

                <h2 className="mt-6 font-semibold text-gray-800">6. Liability</h2>
                <p>We are not liable for losses caused by bugs, misuse, or third-party issues.</p>
            </div>
        </main>
    );
}
