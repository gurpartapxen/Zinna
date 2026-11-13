# Zinna

Zinna is a Next.js ecommerce website for a modern clothing brand.

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` and add the required environment variables for MongoDB,
Stripe, Resend, Cloudinary, Upstash, Auth.js, and the cron job.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Validation

Run the project checks before committing:

```bash
npx tsc --noEmit
npm run lint
npm audit --omit=dev --audit-level=high
npm run build
```

## Stripe local webhooks

Run the Stripe CLI listener in a separate terminal:

```bash
npm run stripe:listen
```

## Deployment

The project is configured for deployment through Vercel. Add the environment
variables in the Vercel project settings before deploying the `main` branch.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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
# Zinna
