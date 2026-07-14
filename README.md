# Voxora - AI-Augmented Language Exchange & Social Platform

Voxora is a real-time language exchange platform designed to bridge the gap between static vocabulary memorization and spoken fluency. The platform enables language learners to connect with global partners for real-time peer-to-peer text messaging and WebRTC video calls, assisted by an inline AI Language Tutor powered by Google Gemini.

---

## 📖 About the Project

Traditional language-learning applications focus on vocabulary drilling and gamified quizzes, leaving learners unprepared for real-world conversations. Voxora addresses this "fluency gap" by combining social networking features with real-time audio/video communication. 

Users can find partners speaking complementary languages (e.g., a native English speaker learning Spanish matched with a native Spanish speaker learning English). As they interact, the platform provides a built-in AI Language Assistant directly inside the chat interface to analyze pronunciation, translate with customizable tones, and correct grammar errors, providing immediate feedback during active practice.

---

## 🚀 Detailed Features

### 🎨 Obsidian-Purple Design System
*   **Premium Visual Palette**: Styled with a dark mode theme consisting of deep obsidian-indigo backgrounds (`#070810`) and dark charcoal-indigo card surfaces (`#121429`).
*   **Permanent Subtle Outlines**: Replaced standard border classes with a permanent purple-tinted outline (`border-primary/20`) across all inputs, cards, and sidebars.
*   **Interactive Micro-animations**: Components feature smooth translations (`translate-y-[-1px]`) and ambient violet glows (`shadow-glow-sm`) on hover states.
*   **Custom Scrollbar Theme**: Integrated purple-tinted Webkit and Firefox scrollbars (`width: 7px`) across all scroll views, including the real-time chat message feed.

### 💬 Real-Time Chat Engine (WebSocket Flow)
*   **Real-time Synchronization**: Powered by GetStream's WebSocket messaging channels to handle message delivery, online indicators, and unread counts.
*   **Dashboard Inbox Shortcut**: Features a **Recent Chats** list on the user dashboard that queries the Stream client for active channels sorted by the latest activity, enabling users to jump directly back into active conversations.

### 🎙️ Native Voice Note Attachments
*   **Hardware Interface**: Captures microphone input using the browser's native **Web Audio & MediaRecorder APIs** as binary chunks.
*   **Blob Packaging**: Compiles chunks into an `audio/webm` Blob and packages it into a standard JavaScript `File` object.
*   **CDN Upload**: Uploads the recording directly to the GetStream CDN using `channel.sendFile()`.
*   **Playable Messages**: Sends the audio link as a message attachment, rendering a playable audio controller inline in the chat feed.

### 📹 Peer-to-Peer Video call Rooms (WebRTC)
*   **WebRTC Media Flow**: Establishes peer connections routed through GetStream's Selective Forwarding Unit (SFU) network to support real-time audio/video streams.
*   **Interactive Templates**: Synchronizes practice templates (Casual, Travel, Debates, Interview) using URL query parameters to help structure peer conversations.
*   **Countdowns & Analytics**: Features a call countdown timer and prompts users for fluency and confidence ratings after each session, which are saved to update dashboard metrics.

### 🤖 Google Gemini AI Language Assistant
*   **Tone-Aware Translation**: Translates text into target languages with selectable tones (Casual, Formal, Friendly, Academic).
*   **Grammar & Clarity Helper**: Analyzes input text, corrects errors, and explains grammatical rules.
*   **Conversation Starters**: Generates icebreaker prompts based on user level and interests.
*   **Voice note Analysis**: Transcribes WebM audio files, evaluates pronunciation, and provides feedback directly inside the chat panel.

---

## 🛠️ Tech Stack & Rationale

### Frontend Client
*   **React 19**: Provides a declarative component tree model and efficient virtual DOM reconciliation.
*   **Vite**: Selected for fast local Hot Module Replacement (HMR) and optimized rollup production bundles.
*   **TailwindCSS**: Used for utility-first styling to maintain a small CSS bundle footprint.
*   **TanStack Query (React Query)**: Manages client-side caching, request deduplication, and loading states for server resources.
*   **Zustand**: Used for global, lightweight client-side state management (such as UI themes).
*   **Framer Motion & GSAP**: Motion handles layout animations, while GSAP runs performance-focused count-up tweens on the dashboard metrics.

### Backend Server
*   **Node.js & Express**: Provides a non-blocking, event-driven JavaScript runtime suitable for routing API requests.
*   **MongoDB & Mongoose ODM**: A document database selected to store flexible, schema-less user profiles, interests, and activity logs.
*   **JWT (JSON Web Tokens)**: Used for stateless session tracking, verifying requests without querying the database each time.

### Third-Party Services
*   **GetStream.io SDKs**: Handles WebSocket messaging and WebRTC media routing.
*   **Google Gemini API**: Processes contextual translations, grammatical analysis, and voice note transcriptions.

---

## ⚙️ Environment Variables & Setup

### 1. Backend Environment Variables (`backend/.env`)
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
JWT_SECRET_KEY=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

### 2. Frontend Environment Variables (`frontend/.env`)
```env
VITE_STREAM_API_KEY=your_stream_api_key
VITE_API_URL=http://localhost:5001/api
```

### 3. Installation & Local Execution
In the `backend/` directory:
```bash
npm install
npm run dev
```

In the `frontend/` directory:
```bash
npm install
npm run dev
```

---

## 🔒 Security Architectures
*   **HTTP-Only Cookies**: JWT session tokens are stored in `HTTP-Only`, `Secure`, and `SameSite=Strict` cookies to block XSS and CSRF token theft.
*   **Input Sanitization**: Mongoose schemas enforce typed constraints to prevent NoSQL query injection attacks.
*   **CORS Whitelisting**: Server routing restricts cross-origin request headers to the configured `FRONTEND_URL`.

---

## 🚀 Production Deployment

### Backend Deployment (Render / Railway)
1.  Configure environment variables (`MONGO_URI`, `STREAM_API_SECRET`, etc.).
2.  Set `FRONTEND_URL` to the deployed client domain to allow cookie credentials.
3.  Start command: `npm install && npm start`.

### Frontend Deployment (Vercel / Netlify)
1.  Configure client variables: `VITE_STREAM_API_KEY` and `VITE_API_URL` (points to backend API).
2.  Build command: `npm run build` and publish directory: `dist`.
