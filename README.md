# No Guide to Womanhood — Waitlist site

A single-page Next.js 15 / React 19 / Tailwind 4 landing page for an upcoming eBook, with an admin control panel, auto-mailing on signup, and MongoDB-backed persistence (Vercel-friendly).

## Features

- Editorial landing page (white + dark pink), fully responsive
- Waitlist form → `POST /api/waitlist` (validation, loading, success, error)
- **Auto welcome email** via [Resend](https://resend.com) on every signup
- **Admin panel** at `/admin`:
  - Edit headline, body, form copy, footer (with live preview)
  - Upload or link a book cover image (stored in Mongo, served via `/api/cover`)
  - View / search / export / delete subscribers (CSV)
- **MongoDB storage** — works on Vercel, Railway, Fly, anywhere
- JWT session cookie + middleware-protected routes

## 1. Spin up a MongoDB

Easiest path: [MongoDB Atlas](https://cloud.mongodb.com) free tier.
- Create a free cluster
- Add your IP (or `0.0.0.0/0` for Vercel)
- Create a database user
- Click **Connect → Drivers → Node.js** and copy the connection string

## 2. Install

```bash
npm install
```

## 3. Configure

```bash
cp .env.local.example .env.local
```

| Variable             | What it does                                                                 |
| -------------------- | ---------------------------------------------------------------------------- |
| `MONGODB_URI`        | Mongo connection string from Atlas (or any Mongo instance)                   |
| `MONGODB_DB`         | Database name (defaults to `noguide`)                                        |
| `RESEND_API_KEY`     | API key from https://resend.com — required to actually send welcome emails  |
| `RESEND_FROM_EMAIL`  | Verified sender, e.g. `No Guide to Womanhood <hello@yourdomain.com>`         |
| `ADMIN_EMAIL`        | Email you log into `/admin` with                                             |
| `ADMIN_PASSWORD`     | Password for `/admin`                                                        |
| `AUTH_SECRET`        | Long random string (32+ chars). Used to sign admin session cookies.          |

If `RESEND_API_KEY` is missing, signups still succeed and are saved — the email step is skipped silently.

## 4. Run

```bash
npm run dev
```

- Landing page: http://localhost:3000
- Admin login:  http://localhost:3000/admin

## 5. Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo on Vercel.
3. Add the **same env vars** from step 3 in Vercel → Project → Settings → Environment Variables.
4. Deploy. Subscribers, edited content, and uploaded covers all live in MongoDB, so they survive every redeploy automatically.

## How the data is laid out in Mongo

Database `noguide`:

| Collection      | Doc shape                                                                 |
| --------------- | ------------------------------------------------------------------------- |
| `meta`          | Single `{ _id: "site", ...SiteContent }` doc with all editable copy       |
| `subscribers`   | `{ email, createdAt, ip, ua }` — unique index on `email`                  |
| `assets`        | Single `{ _id: "cover", data: Binary, contentType, updatedAt }` for cover |

## File layout

```
app/
  page.tsx                       # Landing page
  layout.tsx                     # Fonts, metadata, OG, toaster
  api/waitlist/route.ts          # Public signup endpoint
  api/cover/route.ts             # Serves the cover image from Mongo
  admin/page.tsx                 # Admin login
  admin/dashboard/page.tsx       # Protected admin dashboard
  api/admin/*                    # Login / logout / content / upload / subscribers
components/
  LandingHero.tsx
  WaitlistForm.tsx
  BookCover.tsx
lib/
  mongodb.ts                     # Cached Mongo client (serverless-safe)
  storage.ts                     # Content / subscribers / cover persistence
  auth.ts                        # JWT session + cookie helpers
  email.ts                       # Resend welcome email
middleware.ts                    # Protects /admin/dashboard
```
