# SubTrack

SubTrack is a modern, personal subscription and recurring-bill tracker that helps you stay on top of recurring expenses, detect silent price hikes, track free trial deadlines, and forecast your monthly commitments.

---

## Key Features

- **Centralized Ledger**: Manage all your recurring expenses across weekly, monthly, quarterly, and yearly billing cycles with multi-currency conversion.
- **Visual Analytics**: Interactive spend breakdowns across 7 core categories, 12-month spend trends, and a 12-month future renewal forecast.
- **Price-Hike Sentinel**: Automatically detects when subscription rates increase and highlights affected services.
- **Free Trial Guard**: Track trial cancellation deadlines with step-by-step cancellation instructions and reminders before trial charges land.
- **AI Receipt & Invoice Parser**: Upload receipts, invoices, or screenshots (PDF, images, text) to automatically detect and log subscriptions powered by Google Gemini.
- **Automated Email Reminders**: Receive automated Gmail notifications 1–3 days before upcoming renewals or trial deadlines.
- **Authentication**: Secure sign-in with Email & Password or Google OAuth.

---

## Core Categories

Subscriptions are organized into 7 clear categories:
1. **Entertainment** (Streaming video, music, TV)
2. **Software / AI** (Developer tools, SaaS, cloud infrastructure, AI services)
3. **Gaming** (Consoles, game passes, gaming subscriptions)
4. **News and Media** (Publications, magazines, newsletters)
5. **Education** (Courses, learning platforms, academic services)
6. **Health & Fitness** (Gyms, wellness, fitness trackers)
7. **Other** (Utilities, miscellaneous services)

---

## API Endpoints

All protected endpoints require a JWT token passed in the `Authorization: Bearer <token>` header.

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Log in with email and password | No |
| `POST` | `/api/auth/google` | Sign in or sign up with Google OAuth token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `PUT` | `/api/auth/currency` | Update user base currency (USD, EUR, INR, etc.) | Yes |

### Subscriptions (`/api/subscriptions`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/subscriptions` | List user subscriptions (supports `?status=` filter) | Yes |
| `POST` | `/api/subscriptions` | Create a new subscription or trial | Yes |
| `POST` | `/api/subscriptions/parse-receipt` | Parse receipt/invoice document (PDF, image, text) using Gemini AI | Yes |
| `GET` | `/api/subscriptions/:id` | Get details for a specific subscription | Yes |
| `PUT` | `/api/subscriptions/:id` | Update subscription details (automatically tracks price hikes) | Yes |
| `DELETE` | `/api/subscriptions/:id` | Delete a subscription | Yes |
| `POST` | `/api/subscriptions/:id/confirm-payment` | Record payment and roll over to the next billing cycle | Yes |
| `POST` | `/api/subscriptions/:id/convert-trial` | Convert an active free trial into a standard subscription | Yes |
| `GET` | `/api/subscriptions/:id/price-history` | View price changes log for price-hike alerts | Yes |
| `GET` | `/api/subscriptions/:id/payments` | View logged payments for a specific subscription | Yes |
| `GET` | `/api/subscriptions/payments/recent` | List all recent payments across subscriptions | Yes |

### Dashboard & Analytics (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Spend summaries, category breakdown, trials, and renewals | Yes |
| `GET` | `/api/dashboard/forecast` | 12-month future renewal schedule and spend projection | Yes |
| `GET` | `/api/dashboard/trend` | 12-month historical monthly spend trend | Yes |

### Reminders & Email (`/api/reminders`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/reminders` | List pending and sent in-app/email reminders | Yes |
| `POST` | `/api/reminders/send-due` | Trigger sending due email reminders for current user | Yes |
| `POST` | `/api/reminders/test-email` | Send a test reminder email to verify SMTP setup | Yes |
| `PATCH` | `/api/reminders/:id/dismiss` | Dismiss an active reminder | Yes |
| `GET/POST` | `/api/reminders/cron` | Automated endpoint invoked by Vercel Cron to dispatch emails | CRON_SECRET |

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, PostgreSQL, JWT Authentication
- **AI Integration**: Google Gemini API
- **Email Service**: Nodemailer (Gmail SMTP)
- **Deployment**: Vercel ready (Serverless & Static Hosting)

---

## Quick Start

### 1. Backend Setup
```bash
cd backend
cp .env.example .env     # Configure DATABASE_URL, JWT_SECRET, etc.
npm install
npm run migrate          # Initializes schema & migrations
npm run dev              # Runs on http://localhost:4000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev              # Runs on http://localhost:5173
```
