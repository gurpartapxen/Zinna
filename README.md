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
