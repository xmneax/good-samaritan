This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

**Good Samaritan** – Pi Network faucet app: get 0.01 Pi to unlock lockups (with Pi login, one claim per Pi account and per wallet, ever).

## Setup

### Environment variables

Create a `.env.local` (or `.env`) in the project root with:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `PI_WALLET_PRIVATE_SEED` | Stellar secret key for the app wallet (sends 0.01 Pi) |
| `PI_API_URL` | Pi payments API base URL |
| `PI_API_KEY` | Pi API key for payment approve/complete |
| `NEXT_PUBLIC_PINET_URL` | (Optional) Partner link URL, e.g. Boostr.space |
| `PI_WHITELISTED_WALLETS` | (Optional) Comma-separated wallet addresses that can always receive 0.01 Pi (bypass once-ever limit) |
| `PI_BLOCKED_WALLETS` | (Optional) Comma-separated wallet addresses that are never allowed to claim |

Do not commit `.env*`; they are gitignored.

**Recommended:** Add known abusers to `PI_BLOCKED_WALLETS` (e.g. `GDS6LSN64APSNZTMNJWP2Q4F7NZPNMDRMQNJVJKKZ5HVNNS346K4YMAI`).

### Migrate existing data (optional)

To normalize `recipientWallet` in existing transactions to uppercase (recommended for consistency):

```bash
node --env-file=.env.local scripts/migrate-recipient-wallet-normalize.mjs
```

### Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3600](http://localhost:3600) (this project uses port 3600).

## Getting Started

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
