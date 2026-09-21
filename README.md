# SubTrack

A subscription and recurring-bill tracker. The real-world problem: people lose
track of what they're paying for — forgotten trials, stacked streaming
services, tools nobody uses anymore — and only notice when the bank statement
stings. SubTrack gives a single ledger of every recurring charge, what it
costs per month/year, and what's about to renew.

## Stack

- **Frontend:** React (Vite) + Tailwind CSS + React Router + Recharts
- **Backend:** Node.js + Express (modular routes → controllers → services → models)
- **Database:** PostgreSQL
- **Auth:** JWT (bcrypt-hashed passwords)
- **Validation:** Zod

## Features (MVP)

- Email/password auth, JWT-protected API
- Full CRUD on subscriptions: name, category, amount, currency, billing
  cycle (weekly/monthly/quarterly/yearly), next renewal date, status
- Dashboard: total monthly & yearly spend (normalized across billing
  cycles), active subscription count, renewals due in the next 14 days,
  spend broken down by category
- **Price-hike detection:** every time a subscription's amount is edited,
  the old amount is archived to a price history table. The dashboard
  surfaces any increase from the last 30 days as a "Price alerts" section,
  and the affected subscription gets an in-line badge — so silent price
  hikes (Netflix, Spotify, gym memberships, etc.) don't slip by unnoticed.
- **Spend trend (past 12 months):** reconstructs what normalized monthly
  spend actually was at the start of each of the last 12 months, using each
  subscription's creation date and its recorded price changes. Interactive
  line chart with an average reference line; hovering a month shows the
  month-over-month delta. Answers "is my recurring spend creeping up?"
- **12-month spend forecast:** projects each active subscription's real
  future renewal dates (not just a monthly average) across the next year
  and buckets the totals by month, so months where several yearly
  subscriptions land together are visible ahead of time, not as a
  surprise on the bank statement. Rendered as an interactive line chart —
  hovering a month lists exactly which subscriptions fall due in it, with
  an optional cumulative line.
- Per-user data isolation (every query scoped to the authenticated user)

## Project structure

```
subtrack/
  backend/
    src/
      config/        # env, db pool
      db/            # schema.sql, migration runner
      middleware/     # auth, validation, error handling
      models/         # raw SQL data access
      services/       # business logic (analytics, auth)
      controllers/     # request/response glue
      routes/         # Express routers
      app.js, server.js
  frontend/
    src/
      api/            # fetch client
      context/        # auth context
      pages/          # Login, Register, Dashboard, Subscriptions
      components/     # Navbar, forms, cards
```

## Setup

### 1. Database

Create a PostgreSQL database, then run the migration:

```bash
cd backend
cp .env.example .env       # edit DATABASE_URL, JWT_SECRET
npm install
npm run migrate            # creates tables from src/db/schema.sql
```

### 2. Backend

```bash
cd backend
npm run dev                 # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173 (proxies /api to :4000)
```

Register an account in the UI, then add subscriptions and watch the
dashboard update.

## API summary

| Method | Path                     | Auth | Description               |
|--------|--------------------------|------|----------------------------|
| POST   | /api/auth/register       | no   | Create account, returns JWT |
| POST   | /api/auth/login          | no   | Login, returns JWT        |
| GET    | /api/auth/me             | yes  | Current user               |
| GET    | /api/subscriptions       | yes  | List subscriptions         |
| POST   | /api/subscriptions       | yes  | Create subscription        |
| GET    | /api/subscriptions/:id   | yes  | Get one                    |
| PUT    | /api/subscriptions/:id   | yes  | Update                     |
| DELETE | /api/subscriptions/:id   | yes  | Delete                     |
| GET    | /api/subscriptions/:id/price-history | yes | Amount-change history for one subscription |
| GET    | /api/dashboard/summary   | yes  | Spend totals, breakdown & recent price increases |
| GET    | /api/dashboard/forecast  | yes  | 12-month spend projection by real renewal date |
| GET    | /api/dashboard/trend     | yes  | Reconstructed monthly spend over the past 12 months |

## Possible extensions

- Email/push reminders before renewal (cron job + nodemailer)
- Bank statement CSV import to auto-detect subscriptions
- Multi-currency conversion for the totals

Deliberately **not** in scope here: group/shared expense splitting (e.g.
splitting a trip's costs among friends). That's a different data model
(groups, members, debt settlement) and belongs in its own project rather
than bolted onto a personal subscription tracker.
