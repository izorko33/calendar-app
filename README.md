# Fullstack Calendar App

This is a fullstack TypeScript application that integrates with the Google Calendar API. It allows users to log in using Google OAuth, fetch and view their calendar events, and create new ones.

## 🔧 Stack

- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript
- Database: PostgreSQL (via Prisma)
- Auth: Google OAuth 2.0

---

## 🚀 Features

- Google OAuth login
- View calendar events (grouped by day or week)
- Create new events
- Refresh events manually from Google Calendar
- Filter events by date range: 1, 7, or 30 days

---

## 📁 Project Structure

```
.
├── client/           # React frontend (Vite)
├── server/           # Express backend
├── prisma/           # Prisma schema and migrations
├── docker-compose.yml
└── README.md
```

---

## 🐳 Running Locally with Docker

```bash
# Build and start the stack
docker-compose up --build
```

- Backend: http://localhost:4000
- DB: exposed on localhost:5432

---

## 🔑 Environment Variables

Create `.env` files in the `server` and optionally `client` directories.

### server/.env

```
DATABASE_URL=postgresql://postgres:password@postgres:5432/calendar_db
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=http://localhost:4000/auth/google/callback
PORT=4000
```

---

## 🧪 Development

To run individually without Docker:

### Backend

```bash
cd server
npm install
npx prisma migrate dev --name init
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## ✅ Functionality Checklist

- [x] Google OAuth login
- [x] Event sync from Google Calendar
- [x] Create new calendar events
- [x] Filter by 1/7/30 day range
- [x] Weekly grouping for 30-day range
- [x] Dockerized setup

---

## 📝 Notes

- This app uses the official [Google Calendar API](https://developers.google.com/calendar).
- Design and UI were intentionally kept minimal for simplicity.
- Feel free to expand on this base to support more advanced calendar features.

---
