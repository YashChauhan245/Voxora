# Voxora

Voxora is a language exchange web app where users can connect with learners, chat, do guided video practice sessions, and get AI-powered language help using Gemini 2.5 Flash.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, DaisyUI, TanStack Query, Stream Chat/Video SDK
- Backend: Node.js, Express, MongoDB, Mongoose, JWT cookies
- AI: Gemini API (model: `gemini-2.5-flash`)

## Main Features

- Authentication with JWT cookie sessions
- User onboarding with language profile and availability
- Recommended users with search, filters, and pagination
- Friend request flow (send, accept, outgoing/incoming requests)
- Chat + video call integration via Stream
- Guided practice sessions:
	- pre-call mode, difficulty, duration
	- in-call timer and rotating prompts
	- post-call fluency/confidence rating
- Progress dashboard:
	- minutes spoken
	- sessions completed
	- languages practiced
	- streak days
- AI language assistant in chat:
	- instant translation with tone variants (Literal, Natural, Polite, Casual)
	- grammar + clarity helper (Beginner, Natural, Professional)
	- AI conversation starters
	- voice-note transcript and feedback

## Project Structure

Repository root contains:

- `backend/` - Express API server
- `frontend/` - React client app

## Environment Variables

Create `backend/.env` with:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
JWT_SECRET_KEY=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Frontend uses:

```env
VITE_STREAM_API_KEY=your_stream_api_key
```

## Setup and Run

From `backend/`:

```bash
npm install
npm run dev
```

From `frontend/`:

```bash
npm install
npm run dev
```

Default local URLs:

- Backend: `http://localhost:5001`
- Frontend: `http://localhost:5173`

## Scripts

Backend (`backend/package.json`):

- `npm run dev` - start backend with nodemon

Frontend (`frontend/package.json`):

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run lint` - lint check
- `npm run preview` - preview built app

## API Highlights

Core route groups:

- `/api/auth` - signup, login, logout, me, onboarding
- `/api/users` - recommendations, friends, friend requests, notification counts
- `/api/chat` - Stream token and unread message count
- `/api/ai` - translate, grammar helper, conversation starters, voice feedback
- `/api/progress` - activity events and dashboard metrics

## Security Note

- Never commit `.env` files.
- If any secret key was exposed publicly, rotate it immediately (Mongo, Stream, JWT, Gemini).

