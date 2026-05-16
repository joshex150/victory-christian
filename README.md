# No Guide to Womanhood — Waitlist site

A single-page Next.js 15 / React 19 / Tailwind 4 landing page for an upcoming eBook, with an admin control panel and auto-mailing on signup.

## Features

- Editorial landing page (white + dark pink), fully responsive
- Waitlist form → `POST /api/waitlist` (validation, loading, success, error)
- **Auto welcome email** via [Resend](https://resend.com) on every signup
- **Admin panel** at `/admin`:
  - Edit headline, body, form copy, footer (with live preview)
  - Upload or link a book cover image
  - View / search / export / delete subscribers (CSV)
- File-based storage (`data/*.json`) — no DB required to get started
- JWT session cookie + middleware-protected routes

## 1. Install

```bash
npm install
```

## 2. Configure

Copy the env template and fill it in:

```bash
cp .env.local.example .env.local
```

| Variable             | What it does                                                                 |
| -------------------- | ---------------------------------------------------------------------------- |
| `RESEND_API_KEY`     | API key from https://resend.com — required to actually send welcome emails  |
| `RESEND_FROM_EMAIL`  | Verified sender, e.g. `No Guide to Womanhood <hello@yourdomain.com>`         |
| `ADMIN_EMAIL`        | Email you log into `/admin` with                                             |
| `ADMIN_PASSWORD`     | Password for `/admin`                                                        |
| `AUTH_SECRET`        | Long random string (32+ chars). Used to sign admin session cookies.          |

If `RESEND_API_KEY` is missing, signups still succeed and are saved — the email step is skipped silently.

## 3. Run

```bash
npm run dev
```

- Landing page: http://localhost:3000
- Admin login:  http://localhost:3000/admin

## 4. Deploy

The site is a normal Next.js app and deploys cleanly to any Node host (Railway, Fly, Render, a VPS, etc.). It uses the local filesystem for content + subscribers, so **on serverless platforms with read-only filesystems (e.g. Vercel) you'll want to swap `lib/storage.ts` for a database** (Postgres, Supabase, Neon, etc.) — the interface is small and easy to port.

## File layout

```
app/
  page.tsx                       # Landing page
  layout.tsx                     # Fonts, metadata, OG, toaster
  api/waitlist/route.ts          # Public signup endpoint
  admin/page.tsx                 # Admin login
  admin/dashboard/page.tsx       # Protected admin dashboard
  api/admin/*                    # Login / logout / content / upload / subscribers
components/
  LandingHero.tsx
  WaitlistForm.tsx
  BookCover.tsx
lib/
  storage.ts                     # JSON file storage
  auth.ts                        # JWT session + cookie helpers
  email.ts                       # Resend welcome email
middleware.ts                    # Protects /admin/dashboard
data/                            # subscribers.json + content.json (gitignored)
public/uploads/                  # Uploaded cover images (gitignored)
```
