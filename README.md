# PairUp

A peer-to-peer mock interview matching platform for Minerva University students. Find practice partners by interview type, experience level, and timezone — then schedule sessions automatically via Cal.com.

### Video Demo
https://drive.google.com/drive/folders/1U56skXT89nQwmDcBLSw8vihnHXn9PQJT?usp=sharing

### Vercel deployed Webapp
https://pair-up-five.vercel.app/
## Features

- **Matching** — browse compatible users filtered by interview type (technical, behavioral, case), topics, experience, and timezone overlap
- **Scheduling** — connect your Cal.com account to generate meeting links automatically
- **Sessions** — track upcoming and completed sessions from your dashboard
- **Feedback** — structured post-session ratings and notes for both participants

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Flask 3 (Python), Flask-JWT-Extended |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth + JWT |
| Scheduling | Cal.com OAuth 2.0 + webhooks |

## Project Structure

```
pairUp/
├── client/        # Next.js frontend (port 3000)
└── server/        # Flask backend (port 5001)
```

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- A [Supabase](https://supabase.com) project with PostgreSQL
- (Optional) A [Cal.com](https://cal.com) OAuth app for scheduling

### 1. Backend

```bash
cd server
cp .env.example .env   # fill in values (see below)
pip install -r requirements.txt
python app.py
```

The API runs at `http://localhost:5001`.

**`server/.env` variables:**

```env
FLASK_ENV=development
SECRET_KEY=change-me-to-a-random-64-char-string
JWT_SECRET_KEY=change-me-to-another-random-64-char-string
JWT_ACCESS_TOKEN_EXPIRES=900
JWT_REFRESH_TOKEN_EXPIRES=604800
DATABASE_URL=postgresql://postgres.ssjgkhghpsqduldquedn:cs162mw12!%40@aws-1-us-west-2.pooler.supabase.com:5432/postgres

FRONTEND_URL=http://localhost:3000
CORS_ORIGINs = http://localhost:3000
SUPABASE_URL=https://ssjgkhghpsqduldquedn.supabase.co
SUPABASE_KEY=sb_publishable_lerLc1hYm9w2Q0oHNpnYgQ_giCDVKHg

CAL_CLIENT_ID=f58be6ba54d88e61861a5e0c05698e6fbd6fd6d431632cd9691f1f37895ac7b5                                                                                                                      
CAL_CLIENT_SECRET=c0b47d43f379dbe008c3e1e2dcce4ee2953e6b22f94662d52b2cb3aea9ceff0d
CAL_WEBHOOK_URL=https://nicola-unhideous-riva.ngrok-free.dev/webhooks/cal  
CAL_REDIRECT_URI=http://localhost:3000/auth/cal/callback
CAL_WEBHOOK_SECRET=cs162mw12!

FRONTEND_URL=http://localhost:3000
```

To seed the database with sample data:
```bash
python seed.py
```

### 2. Frontend

```bash
cd client
cp .env.local.example .env.local   # or create it manually
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

**`client/.env.local` variables:**

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## Cal.com Integration

Users can connect their Cal.com account from the profile page. Once connected, PairUp fetches their booking link and uses it to generate meeting links for confirmed sessions. Webhooks notify the backend when bookings are created or cancelled.

To enable this locally you need a Cal.com OAuth app with the redirect URI set to `http://localhost:3000/auth/cal/callback`.
