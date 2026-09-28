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
