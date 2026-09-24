# Kaolorevision

Cameroon GCE (O Level / A Level) past-paper revision app. Next.js (App
Router) + TypeScript + Tailwind CSS + Supabase, built as an installable PWA.

## 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run everything in [`supabase/schema.sql`](supabase/schema.sql).
   This creates the `users`, `documents`, `purchases`, `admins` tables and a
   private `documents` storage bucket.
3. From **Project Settings → API**, copy the Project URL, `anon` key, and
   `service_role` key.

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in the Supabase values, a random `SESSION_SECRET` (a command to
generate one is in the file), and pick an `ADMIN_USERNAME` / `ADMIN_PASSWORD`
for yourself. Leave the `KPAY_*` values blank for now — payments run in mock
mode until those are provided.

## 3. Install dependencies and create the admin account

```bash
npm install
npm run seed:admin
```

`seed:admin` reads `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `.env.local` and
creates (or updates) that admin row. Re-run it any time you change the
password in `.env.local`.

## 4. Run the app

```bash
npm run dev
```

- Student app: <http://localhost:3000>
- Admin dashboard: <http://localhost:3000/admin/login>

Sign up as a student with a Cameroon phone number (`6XXXXXXXX` or
`2376XXXXXXXX`) and any password (6+ characters), then log in to the admin
dashboard separately to upload a test PDF for a subject/year/level and try
the full purchase → viewer flow end to end. Payment is simulated (see below)
so no real money moves.

## Project structure

- `src/app` — pages and API routes (App Router)
- `src/components/app` — student-facing UI
- `src/components/admin` — admin dashboard UI
- `src/components/ui` — shared design-system primitives (glass panels, tilt cards, buttons, inputs)
- `src/lib` — pricing, auth, payment, and Supabase access, all server-only unless noted
- `supabase/schema.sql` — full database schema

## Pricing logic

Defined in [`src/lib/pricing.ts`](src/lib/pricing.ts):

- O Level, questions only: 200 FCFA/subject
- A Level, questions only: 250 FCFA/subject
- Questions + Marking Scheme (either level): 400 FCFA/subject
- Full-year bundle: sum of every available subject at "questions + marking
  scheme", minus a flat 400 FCFA discount — recalculated from whatever is
  actually uploaded for that level/year, so it never needs manual updates.

## Payments (Kpay)

The payment integration is isolated behind one interface,
[`src/lib/payment/types.ts`](src/lib/payment/types.ts) (`PaymentProvider`).
Right now [`src/lib/payment/index.ts`](src/lib/payment/index.ts) returns a
`MockPaymentProvider` that always "confirms" instantly — no real Orange
Money / MTN MoMo charge happens. Once Kpay credentials are available:

1. Add a `KpayProvider` class implementing `PaymentProvider` (same shape as
   `MockPaymentProvider`).
2. Swap the return value in `getPaymentProvider()`.

Nothing else in the app needs to change — the checkout UI, purchase
records, and access control are already provider-agnostic.

## Secure document viewer

Purchased PDFs are never linked directly or made downloadable:

- Files live in a **private** Supabase Storage bucket.
- `/api/viewer/[documentId]` re-checks the session and ownership on every
  request and streams the PDF bytes — there is no public or signed URL to
  copy or share. Unpurchased documents get a server-truncated preview (1-2
  pages, see `src/lib/pdfPreview.ts`) — the rest of the file is never sent
  to the browser at all, not just hidden by the UI.
- The client renders pages with `pdfjs-dist` onto a `<canvas>` (no
  selectable text layer) and overlays a small, subtle brand watermark (no
  personal info).
- `/api/viewer/*` responses are explicitly **never cached**
  (`Cache-Control: private, no-store`), including in the PWA service worker.
  This is deliberate: the same URL returns different content depending on
  who's asking (owner vs. not), so any shared HTTP/SW cache keyed only on
  the URL would let one user's cached full document leak to a different,
  non-owning user on the same device — this was an actual bug caught during
  development and fixed. Offline access to purchased papers isn't
  implemented yet; it would need its own cache explicitly scoped per signed-in
  user (e.g. IndexedDB keyed by `documentId + userId`), not a generic HTTP cache.

## Admin dashboard

`/admin/login` uses a separate admin session/password (seeded via
`npm run seed:admin`), unrelated to student accounts. From
`/admin/documents` you can upload a PDF for a level/year/subject/type with a
price pre-filled from the pricing grid (editable), edit prices, and delete
documents. `/admin/stats` shows purchase counts and revenue for today, 7
days, 30 days, and all time.
