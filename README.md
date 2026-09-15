# SubTrack

A subscription and recurring-bill tracker. The real-world problem: people lose
track of what they're paying for — forgotten trials, stacked streaming
services, tools nobody uses anymore — and only notice when the bank statement
stings. SubTrack gives a single ledger of every recurring charge, what it
costs per month/year, and what's about to renew.

## Stack

- **Frontend:** React (Vite) + Tailwind CSS + React Router
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
| GET    | /api/dashboard/summary   | yes  | Spend totals & breakdown   |

## Possible extensions

- Email/push reminders before renewal (cron job + nodemailer)
- Bank statement CSV import to auto-detect subscriptions
- Multi-currency conversion for the totals
- Shared/family subscriptions with cost-splitting
