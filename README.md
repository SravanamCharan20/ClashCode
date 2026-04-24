# ClashCode

Real-time multiplayer coding contest platform where users join private rooms, solve algorithmic problems in a live arena, and compete on a dynamic leaderboard with instant verdict updates.


## Project Snapshot

- **Category:** Full-stack real-time web application
- **Core experience:** Create room -> invite/join -> start timed contest -> code/run/submit -> live leaderboard -> final results
- **Primary focus:** Fairness, low-latency feedback, and contest orchestration
- **Execution model:** Sandboxed code execution in Docker + async judging queue + socket broadcasts

## What This Project Demonstrates

- Designing a multiplayer contest workflow with real-time synchronization
- Building a robust backend with queue workers, Redis pub/sub, and Socket.IO fan-out
- Implementing role-aware access controls (admin room control vs participant actions)
- Running untrusted code in a constrained Docker sandbox
- Coordinating async submissions with deterministic scoring and leaderboard tie-breaking
- Delivering a polished frontend arena UX with Monaco Editor and live state updates

## Core Features (Detailed)

### 1) Authentication & Session Management

- Email/password signup and signin with JWT issued as an `httpOnly` cookie
- Password hashing and model-level validation
- Auth-protected `/auth/me` bootstrap for persistent frontend sessions
- Logout endpoint clears session cookie cleanly
- Role-aware route protection supports admin-only room creation

### 2) Room Lifecycle (Create -> Join -> Lobby -> Start)

- Admin can create a contest room by selecting problems and duration (validated 5-300 minutes)
- Unique short room code generation for invitation flow
- Participants can join via room code while room is in `waiting` state
- Lobby includes ready-state coordination and participant visibility
- Admin controls room start, completion, and termination actions

### 3) Live Coding Arena

- Dedicated timed contest interface per room
- Monaco-based editor workspace
- Language switching support (`javascript`, `python`)
- Problem panel + editor workspace + header status layout
- Timer-driven contest state with automatic transitions

### 4) Execution & Judging Pipeline

- **Run Code:** immediate evaluation against visible sample test cases
- **Submit Code:** asynchronous full submission workflow through BullMQ
- Worker executes code test-by-test, stops early on first non-AC verdict
- Verdict mapping includes `AC`, `WA`, `RE`, `TLE`, `MLE` (where applicable)
- Submission record persisted for audit/history and results review

### 5) Real-Time Event System

- Socket authentication from JWT cookie
- Lobby events: join, ready toggle, room start, participants updates, errors
- Arena events: timer ticks, room completed/terminated updates
- Submission events: personal result notification + room leaderboard broadcast
- User-targeted channels (`user:<id>`) and room channels (`<roomId>`) for precise fan-out

### 6) Scoring, Ranking, and Results

- First accepted solution for a problem yields score gain
- Wrong verdict penalties reduce score (`WA`, `RE`, `TLE`, `MLE`)
- Tie-breaker uses earliest `lastSolvedAt` after score comparison
- Results page shows final leaderboard and submission stream
- My Contests page summarizes historical room performance (rank, score, solved)

### 7) Problem Management

- Problem bank seeded at server startup
- Problem list and problem details APIs with optional filtering
- Hidden vs visible testcase split to preserve contest integrity

## Architecture Overview

### Frontend (`/frontend`)

- **Framework:** Next.js App Router + React 19
- **Key routes:** auth, contests, room creation/join/lobby, arena, arena results, testing
- **State model:** user auth context + socket lifecycle manager + arena orchestration hook
- **UI composition:** modular arena components (header, problem workspace, editor workspace)

### Backend (`/backend`)

- **Framework:** Express 5 + Socket.IO
- **Persistence:** MongoDB via Mongoose models (`User`, `Room`, `Problem`, `Submission`)
- **Async jobs:** BullMQ submission queue + dedicated worker process
- **Realtime glue:** Redis pub/sub to publish worker results back to socket layer
- **Execution runtime:** Docker-based isolated runner (`clashcode-runner` image)

## Data & Contest Flow

1. User authenticates and joins/creates a room.
2. Admin starts room; timer and contest state sync through sockets.
3. Participant runs sample tests or submits final code.
4. Submission enters BullMQ queue.
5. Worker evaluates code in Docker, computes verdicts, updates score.
6. Worker saves submission, publishes Redis message.
7. Socket layer broadcasts submission/leaderboard updates in real time.
8. Contest ends by timer/admin action; frontend redirects to results view.

## Tech Stack

### Frontend

- Next.js 16
- React 19
- Socket.IO Client
- Monaco Editor (`@monaco-editor/react`)
- Tailwind CSS 4

### Backend

- Node.js + Express 5
- MongoDB + Mongoose
- Socket.IO
- BullMQ
- Redis (`ioredis`)
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Docker (sandbox execution runtime)

## Local Setup (Complete)

### Prerequisites

- Node.js (LTS recommended)
- npm
- MongoDB instance
- Redis server (default expected at `127.0.0.1:6379`)
- Docker installed and running
- Docker image named `clashcode-runner` available locally

### 1) Clone and install dependencies

```bash
git clone <your-repo-url>
cd ClashCode

cd backend && npm install
cd ../frontend && npm install
```

### 2) Configure environment variables

Create backend env at `backend/.env`:

```env
MONGO_URL=<your_mongodb_connection_string>
JWT_SECRET=<a_strong_secret_key>
PORT=9999
CLIENT_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Create frontend env at `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:9999
```

### 3) Start services (3 terminals)

Terminal 1 (backend API + socket server):

```bash
cd backend
npm run dev
```

Terminal 2 (submission worker):

```bash
cd backend
npm run worker
```

Terminal 3 (frontend):

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`.

## Script Reference

### Backend scripts

- `npm run dev` -> starts API server with nodemon
- `npm run worker` -> starts BullMQ submission worker
- `npm start` -> starts API server with node

### Frontend scripts

- `npm run dev` -> starts Next.js dev server
- `npm run build` -> production build
- `npm run start` -> run production build
- `npm run lint` -> ESLint checks

## API Surface (High-Level)

### Auth

- `POST /auth/signup`
- `POST /auth/signin`
- `GET /auth/me`
- `POST /auth/logout`

### Room

- `POST /room/create-room` (admin)
- `POST /room/join-room`
- `GET /room/running-room`
- `GET /room/my-contests`
- `GET /room/:roomId`
- `GET /room/:roomId/leaderboard`
- `GET /room/:roomId/submissions`
- `GET /room/:roomId/results`
- `POST /room/:roomId/complete` (admin)
- `POST /room/:roomId/terminate` (admin)

### Problem

- `GET /problem`
- `GET /problem/:problemId`

### Execution

- `POST /exec/run-code`
- `POST /exec/submit-code`

## Security & Fairness Notes

- Docker runtime constraints: memory/CPU/pids caps, no-network, read-only container FS
- Timeout enforcement prevents infinite-loop abuse
- Contest-only participant access for leaderboard/submissions/results routes
- Hidden testcases reserved for submit path to reduce overfitting to sample tests
- Cookie-based auth with `httpOnly` token storage

## Engineering Highlights

- End-to-end ownership across frontend, backend, realtime, worker infrastructure, and execution sandboxing
- Practical distributed flow: API + queue + worker + pub/sub + socket broadcast
- Strong product focus: cohesive user journey from onboarding to contest results
- Handles non-trivial failure modes: runtime errors, timeout, unauthorized access, stale room states
- Built with extensibility in mind for future contest types, language support, and analytics

