# Zinna

### Modern clothing. Comfortable fits. Your everyday drip.

[![CI](https://github.com/gurpartapxen/Zinna/actions/workflows/ci.yml/badge.svg)](https://github.com/gurpartapxen/Zinna/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/live%20demo-zinna--dripcase.vercel.app-black?logo=vercel)](https://zinna-dripcase.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4.5-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org/)

Zinna is a full-stack ecommerce experience for a modern clothing brand. It combines a visual storefront with a secure backend for product management, stock reservations, Stripe Checkout payments, transactional email, order lookup, and scheduled cleanup.

## Live project

Visit the production deployment: [zinna-dripcase.vercel.app](https://zinna-dripcase.vercel.app/)

## Highlights

- Responsive storefront built for mobile and desktop.
- Product collections for latest drops, hoodies, sweatshirts, and oversized shirts.
- Product detail pages with related products.
- Direct checkout flow with Stripe Checkout.
- Inventory reservation while a customer completes payment.
- Stripe webhook processing for successful, failed, expired, and refunded payments.
- Email-based order lookup with verification codes and rate limiting.
- Newsletter subscription with confirmation email delivery.
- Protected admin area for product and order management.
- Cloudinary-backed product image uploads.
- MongoDB Atlas persistence through Mongoose.
- Upstash Redis rate limiting for sensitive API routes.
- Vercel Hobby-compatible daily reservation cleanup with checkout-time cleanup fallback.
- GitHub Actions CI for TypeScript, ESLint, dependency auditing, and production builds.

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| UI | React, Tailwind CSS, shadcn/ui, Lucide React |
| Database | MongoDB Atlas and Mongoose |
| Payments | Stripe Checkout and webhooks |
| Media storage | Cloudinary |
| Email | Resend |
| Rate limiting | Upstash Redis and `@upstash/ratelimit` |
| Admin authentication | Auth.js credentials flow |
| Deployment | Vercel |
| CI | GitHub Actions |

## Getting started

### Prerequisites

- Node.js 22 or newer
- npm
- A MongoDB Atlas database
- Stripe account and Stripe CLI for local webhook testing
- Cloudinary account
- Resend account
- Upstash Redis database

### Install

```bash
git clone https://github.com/gurpartapxen/Zinna.git
cd Zinna
npm install
```

### Configure environment variables

Create a `.env.local` file in the project root. Never commit this file.

```env
MONGODB_URI=
RESEND_API_KEY=
RESEND_FROM_EMAIL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

AUTH_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

NEXT_PUBLIC_APP_URL=http://localhost:3000

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

CRON_SECRET=
```

Use the REST URL and REST token from the Upstash database connection details. The URL must start with `https://`.

### Start development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Local Stripe webhooks

Run the Next.js server in one terminal:

```bash
npm run dev
```

Run the Stripe listener in another terminal:

```bash
npm run stripe:listen
```

Use the signing secret printed by Stripe CLI as the local `STRIPE_WEBHOOK_SECRET`. The local listener secret is different from the production webhook secret.

For production, create a separate Stripe webhook destination pointing to:

```text
https://your-production-domain.com/api/webhooks/stripe
```

## Available scripts

```bash
npm run dev                 # Start the development server
npm run build               # Create a production build
npm run start               # Start the production server
npm run lint                # Run ESLint
npx tsc --noEmit            # Check TypeScript
npm run seed                # Seed products using .env.local
npm run stripe:listen       # Forward Stripe events locally
```

## Quality checks

Run the main checks before opening a pull request:

```bash
npx tsc --noEmit
npm run lint
npm audit --omit=dev --audit-level=high
npm run build
```

The GitHub Actions workflow in `.github/workflows/ci.yml` runs these checks automatically for pushes and pull requests targeting `main`.

## Project structure

```text
src/
├── app/                  # Routes, pages, API endpoints, and webhooks
├── components/           # Reusable UI and feature components
├── data/                 # Development catalog data
├── lib/                  # Database, payments, email, storage, and security helpers
├── models/               # Mongoose models
└── types/                # Shared TypeScript types

public/                   # Static assets and product images
scripts/                  # Database and development scripts
.github/workflows/        # Continuous integration workflow
vercel.json               # Vercel cron configuration
```

## Production deployment

1. Import the GitHub repository into Vercel.
2. Keep the project root as `./` and use the Next.js preset.
3. Add all production environment variables in Vercel.
4. Set `NEXT_PUBLIC_APP_URL` to the deployed HTTPS domain.
5. Configure a production Stripe webhook and save its signing secret.
6. Verify MongoDB Atlas, Cloudinary, Resend, and Upstash credentials.
7. Deploy the `main` branch.

Environment variables are not committed to this repository. Add them through Vercel Project Settings and redeploy after changing them.

## Security notes

- Keep `.env.local` out of Git.
- Never expose MongoDB, Stripe, Cloudinary, Resend, Auth.js, Redis, or cron secrets with a `NEXT_PUBLIC_` prefix.
- Use separate Stripe test and live credentials.
- Use a separate webhook signing secret for each Stripe environment.
- Keep admin routes and image uploads protected by server-side authorization.
- Rate-limit checkout, authentication, newsletter, chatbot, and order lookup endpoints.
- Treat order lookup codes as short-lived credentials.

## Current deployment

The production app is deployed on Vercel and the `main` branch is validated through GitHub Actions before release.

## License

This project is currently private and intended for the Zinna clothing brand.
