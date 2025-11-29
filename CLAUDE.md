# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 SaaS application called "Karriereadler" that provides AI-powered CV and cover letter optimization services. The application uses a credit-based system where users purchase one-time credits for CV optimization, cover letter generation, or bundles. Built with Next.js App Router, Drizzle ORM, Postgres (Neon), and Stripe for payments.

**Key differences from base template**:
- Uses **one-time payments** instead of subscriptions (Stripe `payment` mode)
- **Credit-based system**: Users buy credits that are consumed when creating requests
- **Request/Admin workflow**: Users submit CV/letter requests which admins process manually (not fully automated AI generation)
- **Email verification required**: Users must verify email before first sign-in
- **Role hierarchy**: `member` < `admin` < `owner` (owner inherits admin permissions)
- **Extended user model**: Includes personal details (firstName, lastName, birthDate, address) collected during signup
- **Contact form**: Persists messages to database with optional email forwarding via Resend

**Note**: Analytics system, language switcher (DE/EN), and night mode features have been removed from the codebase.

## Development Commands

### Essential Commands
- `pnpm dev` — Start Next.js dev server (Webpack, not Turbopack - see note below)
- `pnpm build` — Build production bundle
- `pnpm start` — Run production server

**Important**: This project uses **Tailwind CSS 4.x** which has compatibility issues with Turbopack in Next.js 15. The dev server runs with Webpack. If you encounter HMR errors or PostCSS issues:
1. Stop the dev server (`Ctrl+C`)
2. Clean caches: `rm -rf .next .turbo node_modules/.cache`
3. Restart: `pnpm dev`

### Database Commands
- `pnpm db:setup` — Interactive setup to create `.env` file with database credentials
- `pnpm db:migrate` — Apply Drizzle migrations to database (run after schema changes)
- `pnpm db:generate` — Generate migration files from schema changes in `lib/db/schema.ts`
- `pnpm db:seed` — Seed database with test user (test@test.com / admin123) and team (idempotent)
- `pnpm db:studio` — Open Drizzle Studio to inspect/manage database

### Stripe Testing
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Architecture

### Route Structure

The application uses Next.js App Router with route groups:

- **`app/(login)/`** — Unauthenticated routes: `/sign-in`, `/sign-up`, `/verify-email`
- **`app/(dashboard)/`** — Public and authenticated marketing pages: landing (`/`), pricing, contact, privacy policy, imprint, terms
- **`app/(dashboard)/dashboard/`** — Authenticated dashboard: `/dashboard`, `/dashboard/buy`, `/dashboard/general`, `/dashboard/security`, `/dashboard/activity`, `/dashboard/owner` (owner only)
- **`app/(dashboard)/admin/`** — Admin panel: `/admin`, `/admin/cv-requests/[id]`, `/admin/letter-requests/[id]` (requires `role: 'admin'` or `'owner'`)
- **`app/cv/`** — CV creation workflow: `/cv` (list), `/cv/new` (form)
- **`app/cover-letter/`** — Cover letter creation workflow: `/cover-letter` (list), `/cover-letter/new` (form)
- **`app/api/`** — API routes for checkout, webhooks, orders, admin endpoints, contact

### Authentication & Authorization

**Session Management** (`lib/auth/session.ts`):
- JWT-based sessions using `jose` library
- Session tokens stored in httpOnly cookies, valid for 24 hours
- `AUTH_SECRET` env var required for JWT signing
- Key functions: `getSession()`, `setSession()`, `verifyToken()`

**Middleware** (`middleware.ts`):
- Global middleware protects all `/dashboard` routes
- Automatically refreshes session tokens on GET requests
- Redirects unauthenticated users to `/sign-in`

**Action Middleware** (`lib/auth/middleware.ts`):
- `validatedAction()` — Validates form data with Zod schema
- `validatedActionWithUser()` — Validates and ensures user is authenticated
- `withTeam()` — Ensures user belongs to a team (legacy, team features mostly deprecated)

**Email Verification** (`lib/email.ts`):
- Users must verify their email before signing in
- Verification tokens valid for 24 hours, stored in `users.verificationToken` and `users.verificationTokenExpiry`
- Uses Resend API if `RESEND_API_KEY` is set, otherwise logs verification URL to console (dev mode)
- Verification handled at `/verify-email?token=...` route

### Database Schema (`lib/db/schema.ts`)

**Core Tables**:
- `users` — User accounts with `role` (member/admin/owner), email verification fields, extended personal data (address, birthdate)
- `teams` — Team entities (mostly legacy, still used for activity logging)
- `teamMembers` — User-team relationships with roles (owner/member)
- `orderRequests` — Order requests for CV/Cover Letter/Bundle with customer data, product type, status, Stripe session tracking
- `stripeEvents` — Idempotency tracking for webhook events (prevents duplicate order processing)
- `activityLogs` — User activity tracking (sign in, sign up, password changes, etc.)
- `invitations` — Team invitation system (pending/accepted status)
- `contactMessages` — Contact form submissions with name, email, subject, message, handled flag

**Key Relations**:
- Users have many team memberships and orderRequests
- Teams have many members and activity logs
- Activity logs reference both user and team
- OrderRequests belong to users and track Stripe payment sessions

**Order Status Enum** (`OrderStatus`):
- `PENDING_PAYMENT` — Order created, awaiting payment
- `PAID` — Payment confirmed, ready for processing
- `IN_PROGRESS` — Admin is processing the order
- `COMPLETED` — Order finished and delivered to customer
- `CANCELLED` — Order was cancelled

**Database Queries** (`lib/db/queries.ts`):
- `getUser()` — Get current authenticated user from session cookie
- `getTeamForUser()` — Get user's team with all members (uses Drizzle relational queries)
- `getActivityLogs()` — Get recent activity for current user
- `updateTeamSubscription()` — Update team's Stripe subscription data (legacy subscription support)

### Payment Flow

**One-Time Purchases** (`app/api/checkout/route.ts`):
- Supports three product types: `cv`, `letter`, `bundle`
- Price IDs from env vars: `STRIPE_PRICE_CV_SINGLE`, `STRIPE_PRICE_LETTER_SINGLE`, `STRIPE_PRICE_BUNDLE`
- Creates Stripe checkout session in `payment` mode (not `subscription`)
- Attaches `userId` and `productType` to session metadata

**Webhook Processing** (`app/api/stripe/webhook/route.ts`):
- **Idempotency**: Records `event.id` in `stripeEvents` table to prevent duplicate processing
- **`checkout.session.completed`**: Validates payment and updates order status to PAID
  - Validates session matches order (session ID, email, user ID)
  - Updates OrderRequest status from PENDING_PAYMENT to PAID
  - Sends confirmation email to customer
- Only processes sessions with `payment_status === 'paid'` and `mode === 'payment'`
- **Legacy subscription handlers**: Still handles `customer.subscription.updated/deleted` for backward compatibility

### Order Processing Workflow

**Purchase Flow**:
1. User visits `/kaufen` (requires authentication)
2. Selects product (CV, Cover Letter, or Bundle) and fills in basic customer data
3. Clicks "Zur sicheren Zahlung" → POST to `/api/orders/create`
4. Backend creates `orderRequest` with status `PENDING_PAYMENT` and Stripe checkout session
5. User completes payment on Stripe Checkout
6. Stripe webhook (`checkout.session.completed`) validates payment and updates order to `PAID`
7. Confirmation email sent to customer with dashboard link

**Order Status Flow**:
- `PENDING_PAYMENT` — Order created, awaiting payment
- `PAID` — Payment received, ready for processing
- `IN_PROGRESS` — Admin started working on order
- `COMPLETED` — Order finished and delivered
- `CANCELLED` — Order cancelled

**Admin Panel** (`/admin/orders`):
- Requires `user.role === 'admin'` or `user.role === 'owner'` for access
- Lists all orders with status badges and customer information
- Detail pages at `/admin/orders/[id]` for viewing full order data and customer questionnaire
- Admin can view basicInfo (collected at purchase) and formData (from questionnaire)

### Server Actions

**Authentication Actions** (`app/(login)/actions.ts`):
- `signIn()` — Email/password validation, checks email verification, session creation, activity logging
- `signUp()` — User creation with extended fields (firstName, lastName, birthDate, address), team creation (or invitation acceptance), sends verification email, activity logging
- `signOut()` — Session deletion, activity logging
- `updatePassword()` — Password validation and update with activity logging
- `deleteAccount()` — Soft delete (sets `deletedAt`, appends `-{id}-deleted` to email)
- `updateAccount()` — Update user name, email, and personal data (address, birthdate)

**Team Actions** (in `actions.ts`):
- `inviteTeamMember()` — Creates invitation record (email sending not implemented)
- `removeTeamMember()` — Delete team membership
- All team actions verify user belongs to team and log activity

### Additional Features

**Contact Form** (`/contact`, `app/api/contact/route.ts`):
- Persists all submissions to `contactMessages` table with handled flag
- Optionally forwards to `CONTACT_FORWARD_EMAIL` via Resend (requires `RESEND_API_KEY`)
- Default sender: `Karriereadler <info@karriereadler.com>` (configurable via `EMAIL_FROM`)

**Owner Role Management** (`/dashboard/owner`):
- Owner role inherits all admin permissions
- Owners can promote users to admin or demote admins to member via `/api/owner/admins`
- New signups become `owner` by default
- Owner-only dashboard tab for role management

## Key Patterns

### Activity Logging

Log user actions for audit trail:

```typescript
await logActivity(teamId, userId, ActivityType.SIGN_IN);
```

Available activity types defined in `ActivityType` enum in `lib/db/schema.ts`.

### Validated Server Actions

Use middleware wrappers for type-safe form handling:

```typescript
const schema = z.object({
  email: z.string().email()
});

export const myAction = validatedActionWithUser(schema, async (data, formData, user) => {
  // data is typed and validated
  // user is guaranteed to be authenticated
});
```

## Environment Variables

**Required**:
- `POSTGRES_URL` — Neon Postgres connection string
- `AUTH_SECRET` — JWT signing secret (generate with `openssl rand -base64 32`)
- `BASE_URL` — Application URL (e.g., `http://localhost:3000`)
- `STRIPE_SECRET_KEY` — Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `STRIPE_PRICE_CV_SINGLE` — Stripe price ID for CV product
- `STRIPE_PRICE_LETTER_SINGLE` — Stripe price ID for cover letter product
- `STRIPE_PRICE_BUNDLE` — Stripe price ID for bundle product

**Optional**:
- `RESEND_API_KEY` — Resend API key for sending emails (logs to console if not set)
- `EMAIL_FROM` — Email sender address (defaults to `Karriereadler <info@karriereadler.com>`)
- `ADMIN_NOTIFY_EMAIL` — Email address for admin notifications on new requests (falls back to `EMAIL_FROM`)
- `CONTACT_FORWARD_EMAIL` — Email address to forward contact form submissions to
- `STRIPE_WEBHOOK_SECRET_TEST` — Test webhook secret for local development

## UI & Styling

- **Component Library**: shadcn/ui components in `components/ui/`
- **Styling**: Tailwind CSS 4.x with custom animations (`tw-animate-css`)
- **Icons**: `lucide-react`
- **Animations**: Framer Motion for interactive components
- **User-Facing Text**: German language ("Lebenslauf", "Anschreiben", "Nutzungen")
- **Internal Text**: English code comments and variable names

## Performance & Caching

**Cache Headers** (`next.config.ts`):
- `_next/static/*` — 1 year immutable cache (`max-age=31536000, immutable`)
- `_next/image/*` — 1 year immutable cache
- Static assets (`.svg`, `.png`, `.jpg`, etc.) — 1 day cache with 7-day stale-while-revalidate
- `/api/*` routes — No caching (`no-store`)

**Next.js Configuration**:
- **PPR (Partial Prerendering)**: Enabled experimentally
- **Client Segment Cache**: Enabled for faster navigation
- **Webpack**: Used instead of Turbopack due to Tailwind CSS 4.x compatibility

## Migration Workflow

When modifying `lib/db/schema.ts`:

1. Make schema changes
2. Run `pnpm db:generate` to create migration file
3. Review generated SQL in `lib/db/migrations/`
4. Run `pnpm db:migrate` to apply to local database
5. Commit both schema and migration files

## Testing Notes

- No automated test suite currently exists
- Manual testing via `pnpm dev` and Stripe CLI webhook forwarding
- Test user credentials from seed: `test@test.com` / `admin123`
- Use Stripe test cards: `4242 4242 4242 4242` with any future expiry
- Email verification in dev mode: Check console logs for verification URL

## Production Deployment Checklist

**Pre-launch setup required**:
- Configure Stripe production webhook endpoint
- Set up Resend API key and verify domain for email delivery
- Update all environment variables to production values
- Test payment flow end-to-end with Stripe test mode before going live
