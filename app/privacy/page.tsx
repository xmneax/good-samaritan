export default function Privacy() {
    return (
        <main className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-xl shadow-violet-100/50 p-8 text-gray-700 text-sm leading-relaxed">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Privacy Policy</h1>
            <p>
                <strong>Effective Date:</strong> 13 July 2025
            </p>

            <h2 className="mt-6 font-semibold text-gray-800">1. Information We Collect</h2>
            <ul className="list-disc list-inside">
                <li>Wallet Address to verify Pi balance and process transactions.</li>
                <li>Pi Account Authentication for ownership confirmation.</li>
                <li>Usage data like ad views and interaction logs.</li>
                <li>Device info to prevent abuse.</li>
            </ul>

            <h2 className="mt-6 font-semibold text-gray-800">2. How We Use Your Data</h2>
            <ul className="list-disc list-inside">
                <li>To check wallet eligibility and process microtransactions.</li>
                <li>To enforce fair use limits.</li>
                <li>To improve experience and maintain security.</li>
                <li>To show relevant ecosystem ads.</li>
            </ul>

            <h2 className="mt-6 font-semibold text-gray-800">3. Data Sharing</h2>
            <p>We do not sell your data. We may share anonymized data with partners.</p>

            <h2 className="mt-6 font-semibold text-gray-800">4. Your Choices</h2>
            <p>You may choose not to use the app if you disagree with the policy.</p>

            <h2 className="mt-6 font-semibold text-gray-800">5. Contact</h2>
            <p>For questions, email us at: [Insert Email]</p>
            </div>
        </main>
    );
}
