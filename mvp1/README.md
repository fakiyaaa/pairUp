# PairUp — Peer Mock Interview Platform

CS162 · MVP 1

---

## What It Does

PairUp is a peer directory for mock interview practice. Users onboard by entering their name, role, interview preferences, and an optional Calendly link. They then land on a Browse page where they can see everyone else who has signed up and book sessions directly.

---

## Standalone Architecture

The app runs entirely on your machine — no cloud, no external accounts, no setup beyond `npm install`.

- **Frontend** — React + Vite on `localhost:5173`
- **Backend** — Express.js on `localhost:3001`
- **Database** — SQLite file, auto-created on first run

User identity is stored as a UUID in `localStorage` — no login required. All browsers pointing to the same running server share the same database and can see each other's profiles in real time.

**Intentionally excluded in MVP 1:** authentication, ratings, search/filtering, profile editing.

---

## Running Locally

**Prerequisites:** Node.js v18+

```bash
git clone https://github.com/YOUR_USERNAME/pairup.git
cd pairup
npm install
npm run dev
```

Open **http://localhost:5173**

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Express.js |
| Database | SQLite (better-sqlite3) |
| Dev tooling | Concurrently |

---

*CS162 · MVP 1 of 3*