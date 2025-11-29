# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 SaaS application called "Karriereadler" that provides AI-powered CV and cover letter optimization services. The application uses a credit-based system where users purchase one-time credits for CV optimization, cover letter generation, or bundles. Built with Next.js App Router, Drizzle ORM, Postgres (Neon), and Stripe for payments.

**Key differences from base template**:
- Uses **one-time payments** instead of subscriptions (Stripe `payment` mode)
- **Credit-based system**: Users buy credits that are consumed when creating requests
- **Request/Admin workflow**: Users submit CV/letter requests which admins process manually (not fully automated AI generation)
- **Email verification required**: Users must verify email before first sign-in
- **Admin role system**: `user.role === 'admin'` grants access to `/admin` panel
- **Extended user model**: Includes personal details (firstName, lastName, birthDate, address) collected during signup

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
- **`app/(dashboard)/`** — Authenticated marketing and dashboard pages: landing (`/`), pricing, dashboard, privacy policy, imprint
- **`app/(dashboard)/dashboard/`** — Nested authenticated dashboard: `/dashboard`, `/dashboard/buy`, `/dashboard/general`, `/dashboard/security`, `/dashboard/activity`
- **`app/cv/`** — CV creation workflow: `/cv` (list), `/cv/new` (form)
- **`app/cover-letter/`** — Cover letter creation workflow: `/cover-letter` (list), `/cover-letter/new` (form)
- **`app/admin/`** — Admin panel for managing CV and cover letter requests (requires `role: 'admin'`)
- **`app/api/`** — API routes for checkout, webhooks, purchases, CV/cover letter requests, admin endpoints

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
- `users` — User accounts with `cvCredits` and `letterCredits` (integer counters), email verification fields, extended personal data (address, birthdate)
- `teams` — Team entities (mostly legacy, still used for activity logging)
- `teamMembers` — User-team relationships with roles (owner/member)
- `stripeEvents` — Idempotency tracking for webhook events (prevents duplicate credit grants)
- `activityLogs` — User activity tracking (sign in, sign up, password changes, etc.)
- `invitations` — Team invitation system (pending/accepted status)
- `cvRequests` — CV optimization requests with personal data, work experience, education, skills (JSON fields), photo path, job description
- `letterRequests` — Cover letter requests with job details, company info, experiences to highlight, optional reference to cvRequest

**Key Relations**:
- Users have many team memberships, cvRequests, and letterRequests
- Teams have many members and activity logs
- Activity logs reference both user and team
- LetterRequests can optionally reference a cvRequest

**Request Status Enum** (`RequestStatus`):
- `offen` — New request, not yet processed
- `in_bearbeitung` — Request currently being worked on
- `fertig` — Request completed

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
- **`checkout.session.completed`**: Grants credits atomically in transaction:
  - `cv` → +1 cvCredits
  - `letter` → +2 letterCredits (matches marketing: "zwei individuelle Anschreiben")
  - `bundle` → +1 cvCredits, +2 letterCredits
- Only processes sessions with `payment_status === 'paid'` and `mode === 'payment'`
- **Legacy subscription handlers**: Still handles `customer.subscription.updated/deleted` for backward compatibility

**Credit System**:
- Credits stored as integers on `users` table: `cvCredits`, `letterCredits`
- Atomic decrement on use: `UPDATE users SET cvCredits = cvCredits - 1 WHERE id = ? AND cvCredits >= 1 RETURNING *`
- If update returns no rows, user had insufficient credits (prevents race conditions)

### Request Processing Workflow

**CV Request Flow**:
1. User fills out form at `/cv/new` with personal data, work experience, education, skills, optional job description
2. User can upload photo via `/api/upload/photo` (stored in `public/uploads/`)
3. Form submission POSTs to `/api/cv-request`
4. Backend atomically decrements cvCredits and creates cvRequest record with status `offen`
5. Admin views request at `/admin` and can update status to `in_bearbeitung` or `fertig` via `/api/admin/cv-requests/[id]`
6. Request data stored with JSON fields for complex structures (workExperience, education, skills, other)

**Cover Letter Request Flow**:
1. User fills out form at `/cover-letter/new` with job details, company info, experiences to highlight
2. Can optionally link to existing CV request via `cvRequestId`
3. Form submission POSTs to `/api/letter-request`
4. Backend atomically decrements letterCredits and creates letterRequest record with status `offen`
5. Admin manages requests via `/admin` panel

**Admin Panel** (`/admin`):
- Requires `user.role === 'admin'` for access
- Lists all CV and letter requests with status badges
- Provides stats dashboard (total requests, open requests per type)
- Detail pages at `/admin/cv-requests/[id]` and `/admin/letter-requests/[id]` for viewing full request data and updating status

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

## Key Patterns

### Working with JSON Fields

CV and letter requests use JSON fields for complex nested data. When creating or updating requests:

```typescript
// workExperience is stored as stringified JSON in the database
const cvRequest = await db.insert(cvRequests).values({
  userId: user.id,
  workExperience: JSON.stringify([
    { company: 'Acme Inc', position: 'Developer', startDate: '2020-01', endDate: '2023-06' }
  ]),
  education: JSON.stringify([...]),
  skills: JSON.stringify({ technical: ['React', 'Node.js'], languages: ['German', 'English'] }),
  other: JSON.stringify({ certificates: ['AWS'], driverLicense: 'B' })
});

// When reading, parse the JSON strings
const parsedRequest = {
  ...request,
  workExperience: JSON.parse(request.workExperience || '[]'),
  education: JSON.parse(request.education || '[]')
};
```

### Atomic Credit Operations

Always use this pattern for credit consumption to prevent race conditions:

```typescript
const [updated] = await db
  .update(users)
  .set({ cvCredits: sql`${users.cvCredits} - 1` })
  .where(and(eq(users.id, userId), sql`${users.cvCredits} >= 1`))
  .returning();

if (!updated) {
  return { error: 'Insufficient credits' };
}

// Only proceed with AI call after successful credit reservation
```

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

### File Uploads

Photo uploads for CV requests:

```typescript
// Upload endpoint: POST /api/upload/photo
// Accepts multipart/form-data with 'photo' field
// Returns: { path: '/uploads/filename.jpg' }
// Files stored in: public/uploads/
// Access in DB: cvRequests.photoPath
```

**Important**: The `public/uploads/` directory should be added to `.gitignore` to avoid committing uploaded files.

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
- `RESEND_API_KEY` — Resend API key for sending verification emails (logs to console if not set)
- `EMAIL_FROM` — Email sender address (defaults to `info@karriereadler.com`)

## UI & Styling

- **Component Library**: shadcn/ui components in `components/ui/`
- **Styling**: Tailwind CSS 4.x
- **Icons**: `lucide-react`
- **User-Facing Text**: German language ("Lebenslauf", "Anschreiben", "Nutzungen")
- **Internal Text**: English code comments and variable names

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
