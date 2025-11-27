# Next.js SaaS Starter

This is a starter template for building a SaaS application using **Next.js** with support for authentication, Stripe integration for payments, and a dashboard for logged-in users.

**Demo: [https://next-saas-start.vercel.app/](https://next-saas-start.vercel.app/)**

## Features

- Marketing landing page (`/`) with animated Terminal element
- Pricing page (`/pricing`) which connects to Stripe Checkout
- Dashboard pages with CRUD operations on users/teams
- Basic RBAC with Owner and Member roles
- Subscription management with Stripe Customer Portal
- Email/password authentication with JWTs stored to cookies
- Global middleware to protect logged-in routes
- Local middleware to protect Server Actions or validate Zod schemas
- Activity logging system for any user events

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [Postgres](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Payments**: [Stripe](https://stripe.com/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

```bash
git clone https://github.com/nextjs/saas-starter
cd saas-starter
pnpm install
```

## Running Locally

[Install](https://docs.stripe.com/stripe-cli) and log in to your Stripe account:

```bash
stripe login
```

Use the included setup script to create your `.env` file:

```bash
pnpm db:setup
```

Run the database migrations and seed the database with a default user and team:

```bash
pnpm db:migrate
pnpm db:seed
```

This will create the following user and team:

- User: `test@test.com`
- Password: `admin123`

You can also create new users through the `/sign-up` route.

Finally, run the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

You can listen for Stripe webhooks locally through their CLI to handle subscription change events:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Testing Payments

To test Stripe payments, use the following test card details:

- Card Number: `4242 4242 4242 4242`
- Expiration: Any future date
- CVC: Any 3-digit number

## Going to Production

When you're ready to deploy your SaaS application to production, follow these steps:

### Set up a production Stripe webhook

1. Go to the Stripe Dashboard and create a new webhook for your production environment.
2. Set the endpoint URL to your production API route (e.g., `https://yourdomain.com/api/stripe/webhook`).
3. Select the events you want to listen for (e.g., `checkout.session.completed`, `customer.subscription.updated`).

### Deploy to Vercel

1. Push your code to a GitHub repository.
2. Connect your repository to [Vercel](https://vercel.com/) and deploy it.
3. Follow the Vercel deployment process, which will guide you through setting up your project.

### Add environment variables

In your Vercel project settings (or during deployment), add all the necessary environment variables. Make sure to update the values for the production environment, including:

1. `BASE_URL`: Set this to your production domain.
2. `STRIPE_SECRET_KEY`: Use your Stripe secret key for the production environment.
3. `STRIPE_WEBHOOK_SECRET`: Use the webhook secret from the production webhook you created in step 1.
4. `POSTGRES_URL`: Set this to your production database URL.
5. `AUTH_SECRET`: Set this to a random string. `openssl rand -base64 32` will generate one.

## Other Templates

While this template is intentionally minimal and to be used as a learning resource, there are other paid versions in the community which are more full-featured:

- https://achromatic.dev
- https://shipfa.st
- https://makerkit.dev
- https://zerotoshipped.com
- https://turbostarter.dev

## Karriereadler specifics

- **Run**: `pnpm dev` (dev), `pnpm build && pnpm start` (prod).
- **Language**: Header DE/EN switcher with browser-language fallback. Stored in `localStorage` (`ka-lang`).
- **Analytics**:
  - Pseudonymous visitor/session IDs in `localStorage` only after consent.
  - Events POST to `/api/analytics/events`; summaries at `/api/analytics/summary` (admin/owner only).
  - Dashboard tab `/dashboard/analytics` shows visitors, new vs returning, session time, pages per session, and per-page stats.
  - Honors cookie consent; analytics stays disabled until optional cookies accepted.
- **Roles**:
  - `users.role` supports `member`, `admin`, `owner` (owner inherits admin).
  - New sign-ups become `owner`. Owners can add/remove admins via `/dashboard/owner` (API `/api/owner/admins`).
  - Dashboard sidebar shows Analytics/Admin for admin/owner, Owner tab only for owner.
- **Contact form**: `/contact` posts to `/api/contact`, persists in `contact_messages`. Set `CONTACT_FORWARD_EMAIL` (+ `RESEND_API_KEY`) to forward via Resend; default Absender ist `Karriereadler <noreply@karriereadler.com>`.
- **Cookie banner & consent**: Banner stores choice in `ka-consent` cookie + `localStorage`; footer has “Cookie-Einstellungen”. Analytics blocked until consent for optional cookies.
- **Caching**: `next.config.ts` sends long cache headers for `_next/static` and static assets; API routes are `no-store`.
- **Database**: New tables `contact_messages` and `analytics_events` added; run `pnpm db:generate && pnpm db:migrate` after pulling.
