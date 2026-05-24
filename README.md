# Voxora

Voxora is a full-stack language exchange platform that pairs learners for chat and guided video practice, with a built-in AI tutor powered by Gemini 2.5 Flash. It combines real-time messaging, video calls, onboarding and matching, and progress analytics into a single product.

## Highlights

- Auth + onboarding flow with JWT cookie sessions
- Smart partner discovery with filters and pagination
- Friend request system with notifications and unread counts
- Real-time chat using Stream Chat SDK
- Guided video practice sessions with prompts, timers, and ratings
- AI language assistant (translation, grammar, conversation starters, voice feedback)
- Progress dashboard with streaks and activity metrics

## Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS + DaisyUI
- TanStack Query
- Stream Chat React + Stream Video SDK
- Zustand

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT (httpOnly cookies)
- Stream Chat Server SDK
- Gemini API (gemini-2.5-flash)

## Architecture Overview

- **Client**: Vite React app with routes for chat, calls, onboarding, assistant, friends, and dashboard
- **API**: Express server exposing `/api/*` endpoints, secured via cookie JWT middleware
- **Realtime**: Stream Chat/Video for messaging and calls, tokens issued by backend
- **AI**: Gemini API for translation, grammar, conversation starters, and voice feedback
- **Data**: MongoDB models for users, friend requests, and activity events

## Project Structure

```
backend/              # Express API server
  src/
    controllers/      # Request handlers
    lib/              # DB, Stream, Gemini helpers
    middleware/       # Auth middleware
    models/           # Mongoose schemas
    routes/           # API routes
frontend/             # Vite React app
  src/
    components/       # UI and feature components
    hooks/            # Auth and API hooks
    lib/              # API client + helpers
    pages/            # Route-level screens
```

## Environment Variables

Create `backend/.env`:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
JWT_SECRET_KEY=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

Create `frontend/.env`:

```env
VITE_STREAM_API_KEY=your_stream_api_key
```

Note: the frontend API base URL is currently hard-coded in `frontend/src/lib/axios.js` to `http://localhost:5001/api`. Update this value for production deployments.

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Stream Chat + Stream Video credentials
- Google Gemini API key

### Install

From `backend/`:

```bash
npm install
```

From `frontend/`:

```bash
npm install
```

### Run (development)

From `backend/`:

```bash
npm run dev
```

From `frontend/`:

```bash
npm run dev
```

Default local URLs:
- Backend: `http://localhost:5001`
- Frontend: `http://localhost:5173`

### Build (production)

From `frontend/`:

```bash
npm run build
npm run preview
```

From `backend/`:

```bash
npm start
```

## Core Features (A to Z)

### Authentication and Onboarding
- Signup and login with JWT stored in httpOnly cookies
- Profile onboarding with language preferences, location, and availability
- Auto-generated avatar via DiceBear

### Discovery and Connections
- Recommended users with filters (language, location, availability, name search)
- Friend request lifecycle (send, accept, pending/outgoing)
- Notifications with counts for requests and new connections

### Real-Time Chat
- 1:1 chat channels via Stream Chat
- Unread counts in sidebar and navbar
- Voice typing using browser speech recognition

### Guided Video Practice
- Stream Video calls with configurable mode, difficulty, and duration
- In-call timer and rotating prompts
- Post-call rating (fluency/confidence)
- Session events logged for analytics

### AI Tutor
- **Translate** with tone variants (literal, natural, polite, casual)
- **Grammar helper** with modes (beginner, natural, professional)
- **Conversation starters** based on user preferences
- **Voice feedback**: transcription, corrections, pronunciation tips, optional translation

### Progress Dashboard
- Weekly minutes spoken
- Sessions completed
- Languages practiced
- Streak tracking
- Recent activity feed

## API Reference (Highlights)

Base URL: `/api`

**Auth**
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/onboarding`
- `GET /auth/me`

**Users**
- `GET /users` (recommendations, filters)
- `GET /users/friends`
- `POST /users/friend-request/:id`
- `PUT /users/friend-request/:id/accept`
- `GET /users/friend-requests`
- `GET /users/outgoing-friend-requests`
- `GET /users/notification-counts`

**Chat**
- `GET /chat/token`
- `GET /chat/unread-count`

**AI**
- `POST /ai/translate`
- `POST /ai/grammar`
- `POST /ai/starters`
- `POST /ai/voice-feedback`

**Progress**
- `POST /progress/events`
- `GET /progress/dashboard`

## Data Models

**User**
- `fullName`, `email`, `password` (hashed)
- `bio`, `profilePic`
- `nativeLanguage`, `learningLanguage`, `location`, `availability`
- `isOnboarded`, `friends[]`

**FriendRequest**
- `sender`, `recipient`, `status`

**ActivityEvent**
- `eventType`, `durationMinutes`, `language`, `metadata`, timestamps

## Security Notes

- JWT stored in httpOnly cookies with `sameSite=strict`
- Passwords hashed with bcrypt
- CORS is restricted to `FRONTEND_URL`
- MongoDB connection errors are redacted to avoid leaking credentials

## Production Notes

- Set `NODE_ENV=production` to enable secure cookies
- Configure Stream and Gemini keys in server environment
- Update frontend API base URL for deployment
- Add rate limiting and logging middleware if deploying to public traffic

## Scripts

**Backend**
- `npm run dev` - nodemon server
- `npm start` - production server

**Frontend**
- `npm run dev` - Vite dev server
- `npm run build` - production build
- `npm run preview` - preview build
- `npm run lint` - eslint

## Roadmap Ideas

- Push notifications for friend requests
- Multi-language UI
- AI session summaries and weekly goals
- Moderation tooling and abuse reporting


