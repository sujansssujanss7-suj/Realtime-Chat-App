# Realtime Chat Application

A real-time mobile chat application built with React Native (Expo), Node.js, Express, Socket.io, and MongoDB Atlas. Messages are delivered instantly across devices via WebSocket and persisted in a cloud database.

**Production Backend:** https://realtime-chat-app-jhnx.onrender.com

---

## Table of Contents

1. [Overview](#1-overview)
2. [Features](#2-features)
3. [Architecture](#3-architecture)
4. [Tech Stack](#4-tech-stack)
5. [Project Structure](#5-project-structure)
6. [Backend Setup](#6-backend-setup)
7. [Frontend Setup](#7-frontend-setup)
8. [REST API Documentation](#8-rest-api-documentation)
9. [Socket.io Events](#9-socketio-events)
10. [Database](#10-database)
11. [Error Handling and Validation](#11-error-handling-and-validation)
12. [Deployment](#12-deployment)
13. [Testing](#13-testing)
14. [Design Decisions](#14-design-decisions)
15. [Environment Variables](#15-environment-variables)
16. [Future Improvements](#16-future-improvements)
17. [Author](#17-author)

---

## 1. Overview

This is a real-time mobile chat application that allows multiple users on separate devices to exchange messages instantly. Users enter a username to join a shared chat room — no account or registration required.

Key capabilities:
- **Instant messaging** via Socket.io WebSocket connections
- **Persistent chat history** stored in MongoDB Atlas and loaded on entry
- **REST API** for fetching and creating messages independently of the socket layer
- **Typing indicators** and **online user count** displayed in real time
- **Message delivery and read receipts** tracked per message
- **Graceful connection handling** including reconnection logic and disconnect notifications

---

## 2. Features

| Feature | Status |
|---|---|
| Real-time messaging via Socket.io | ✅ Implemented |
| Multi-device / two-user communication | ✅ Implemented |
| Persistent chat history (MongoDB) | ✅ Implemented |
| Chat history loaded on screen entry | ✅ Implemented |
| Username-based chat (no account needed) | ✅ Implemented |
| Message timestamps (`createdAt`) | ✅ Implemented |
| Delivered / read status per message | ✅ Implemented |
| Typing indicators | ✅ Implemented |
| Online user count | ✅ Implemented |
| User join / leave notifications | ✅ Implemented |
| REST API (GET & POST messages) | ✅ Implemented |
| Input validation (client + server) | ✅ Implemented |
| Centralized error handling | ✅ Implemented |
| Socket reconnection logic | ✅ Implemented |
| Graceful server shutdown (SIGTERM) | ✅ Implemented |
| User authentication / login | ❌ Not implemented |

---

## 3. Architecture

```
┌──────────────────────────────────┐
│   Mobile App (React Native Expo) │
│                                  │
│  • Username entry screen         │
│  • Chat screen                   │
│  • components/  services/        │
└───────────┬──────────────────────┘
            │
            │  REST API (HTTP/HTTPS)   → GET /api/messages
            │                          → POST /api/messages
            │  Socket.io (WSS)         → sendMessage, typing, messageRead …
            ▼
┌──────────────────────────────────┐
│  Node.js + Express + Socket.io   │
│  (Deployed on Render)            │
│                                  │
│  • Express routes  /api/*        │
│  • Socket.io event handlers      │
│  • CORS + JSON middleware        │
│  • Centralized error handler     │
└───────────┬──────────────────────┘
            │  Mongoose ODM
            ▼
┌──────────────────────────────────┐
│  MongoDB Atlas (Cloud Database)  │
│                                  │
│  • messages collection           │
│  • Persists all chat messages    │
└──────────────────────────────────┘
```

**Layer responsibilities:**

- **Mobile App** — Renders the UI, manages socket lifecycle, calls the REST API for history, emits and listens for socket events.
- **Node.js / Express / Socket.io** — Handles HTTP routes, validates requests, saves messages via Mongoose, broadcasts events to all connected clients.
- **MongoDB Atlas** — Stores all messages durably. Messages survive server restarts and are returned on reconnection.

---

## 4. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React Native + Expo | Expo SDK 57 |
| **Frontend language** | TypeScript | ~6.0.3 |
| **Frontend routing** | expo-router | ~57.0.23 |
| **HTTP client** | Axios | ^1.7.0 |
| **Backend** | Node.js + Express | Express ^4.18.2 |
| **Real-time** | Socket.io | ^4.7.5 (server + client) |
| **Database** | MongoDB Atlas | Cloud-hosted |
| **ODM** | Mongoose | ^8.2.4 |
| **CORS** | cors | ^2.8.5 |
| **Environment** | dotenv | ^16.4.5 |
| **Dev server** | nodemon | ^3.1.0 |
| **Deployment** | Render | Free tier web service |

---

## 5. Project Structure

```
Realtime-Chat-App/
├── render.yaml                    # Render infrastructure-as-code (deployment config)
├── .gitignore
├── backend/
│   ├── package.json
│   ├── .env.example               # Environment variable template (safe to commit)
│   └── src/
│       ├── server.js              # Express app, Socket.io setup, server entry point
│       ├── config/
│       │   └── db.js              # MongoDB Atlas connection via Mongoose
│       ├── controllers/
│       │   └── messageController.js  # getMessages, createMessage, healthCheck
│       ├── middleware/
│       │   └── errorHandler.js    # Centralized Express error handler
│       ├── models/
│       │   └── Message.js         # Mongoose Message schema
│       ├── routes/
│       │   └── messageRoutes.js   # Express router — /api/health, /api/messages
│       └── sockets/
│           └── chatSocket.js      # All Socket.io event logic
└── frontend/
    ├── app.json                   # Expo configuration (includes BACKEND_URL)
    ├── package.json
    ├── tsconfig.json
    ├── babel.config.js
    ├── app/
    │   ├── _layout.tsx            # Expo Router root layout
    │   ├── index.tsx              # Username entry screen
    │   └── chat.tsx               # Main chat screen
    ├── components/
    │   ├── ChatInput.tsx          # Message text input with send button
    │   ├── MessageBubble.tsx      # Individual message bubble (sent/received)
    │   ├── OnlineStatus.tsx       # Connection status + online user count
    │   └── TypingIndicator.tsx    # Animated typing indicator
    ├── constants/
    │   └── config.ts              # BACKEND_URL resolution, app-wide constants
    ├── services/
    │   ├── api.ts                 # Axios REST API service (fetchMessages, postMessage)
    │   └── socket.ts              # Socket.io client — connect, emit, listen
    └── types/
        └── chat.ts                # TypeScript interfaces for all data shapes
```

---

## 6. Backend Setup

### Prerequisites

- Node.js ≥ 18.0.0
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster with a connection string

### Install dependencies

```bash
cd backend
npm install
```

### Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` and set the following variables (do **not** commit this file):

```
PORT=
MONGO_URI=
CLIENT_URL=
NODE_ENV=
```

> See [Section 15 — Environment Variables](#15-environment-variables) for a description of each variable.

### Start the backend

**Development** (auto-restarts on file changes via nodemon):

```bash
npm run dev
```

**Production:**

```bash
npm start
```

The server starts on `http://0.0.0.0:PORT` and logs the active environment and CORS origin.

---

## 7. Frontend Setup

### Install dependencies

```bash
cd frontend
npm install
```

### Backend URL configuration

The frontend reads the backend URL from `app.json → expo.extra.BACKEND_URL`:

```json
"extra": {
  "BACKEND_URL": "https://realtime-chat-app-jhnx.onrender.com"
}
```

`frontend/constants/config.ts` resolves this value via `expo-constants` and uses it for both REST API calls (Axios) and the Socket.io connection. A local development fallback URL is defined in `config.ts` for development without the deployed backend.

### Start the development server

```bash
npx expo start --clear
```

Scan the QR code in the **Expo Go** app on your Android or iOS device. Expo Go loads the local Metro bundle — no build step required.

---

## 8. REST API Documentation

All endpoints are prefixed with `/api`. The server is mounted at the production URL:
`https://realtime-chat-app-jhnx.onrender.com`

---

### GET /api/health

**Purpose:** Verify that the server is reachable and running.

**Response — 200 OK:**
```json
{
  "status": "OK",
  "message": "Chat server is running"
}
```

---

### GET /api/messages

**Purpose:** Fetch the full chat history, sorted chronologically (oldest message first).

**Response — 200 OK:**
```json
{
  "success": true,
  "messages": [
    {
      "_id": "6abaaeea6b10f31b95a561bd",
      "username": "Alice",
      "text": "Hello!",
      "delivered": true,
      "read": true,
      "createdAt": "2026-09-28T18:16:10.691Z",
      "updatedAt": "2026-09-28T18:16:10.691Z",
      "__v": 0
    }
  ]
}
```

---

### POST /api/messages

**Purpose:** Create and persist a new message via REST. (In normal app operation, messages are sent via Socket.io. This endpoint is available for direct API access and fallback use.)

**Request body:**
```json
{
  "username": "Sujan",
  "text": "Hello"
}
```

**Validation:**
- `username` — required, trimmed, maximum **50 characters**
- `text` — required, trimmed, non-empty, maximum **500 characters**

**Response — 201 Created:**
```json
{
  "success": true,
  "message": {
    "_id": "6abb4baa4c95620dda6b5c1b",
    "username": "Sujan",
    "text": "Hello",
    "delivered": false,
    "read": false,
    "createdAt": "2026-09-29T05:24:58.401Z",
    "updatedAt": "2026-09-29T05:24:58.401Z",
    "__v": 0
  }
}
```

**Response — 400 Bad Request** (validation failure):
```json
{
  "success": false,
  "message": "Username is required"
}
```

---

## 9. Socket.io Events

The socket server supports both `websocket` and `polling` transports. The client attempts WebSocket first and falls back to polling.

---

### Client → Server

| Event | Payload | Purpose |
|---|---|---|
| `userJoin` | `username: string` | Register the user after connecting. Triggers join notification and online count broadcast. |
| `sendMessage` | `{ username: string, text: string }` | Send a new message. Validated, saved to MongoDB, then broadcast to all clients. |
| `typing` | `username: string` | Notify other users that this user is typing. |
| `stopTyping` | `username: string` | Notify other users that this user stopped typing. |
| `messageRead` | `{ messageId: string, username: string }` | Mark a message as read. Updates MongoDB and broadcasts the read receipt. |

---

### Server → Client

| Event | Payload | Purpose |
|---|---|---|
| `newMessage` | Full `Message` object (see [Section 10](#10-database)) | Broadcast to **all** connected clients when a message is saved successfully. |
| `userJoined` | `{ username: string, onlineCount: number }` | Sent to all **other** clients when a user joins. |
| `userLeft` | `{ username: string, onlineCount: number }` | Broadcast when a user disconnects. |
| `onlineCount` | `{ count: number }` | Broadcast to all clients whenever the online count changes. |
| `typing` | `{ username: string }` | Forwarded to all other clients when a user is typing. |
| `stopTyping` | `{ username: string }` | Forwarded to all other clients when a user stops typing. |
| `messageRead` | `{ messageId: string, username: string }` | Broadcast to all clients when a message is marked as read. |
| `messageError` | `{ message: string }` | Sent to the **sender only** if their message failed validation or could not be saved. |

---

## 10. Database

**Database:** MongoDB Atlas (cloud-hosted)
**Collection:** `messages`
**ODM:** Mongoose

### Message Schema

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Auto | — | Unique message identifier (MongoDB) |
| `username` | String | Yes | — | Name of the user who sent the message (max 50 chars) |
| `text` | String | Yes | — | Message content (max 500 chars, cannot be blank) |
| `delivered` | Boolean | No | `false` | Set to `true` by the Socket.io handler when the message is broadcast |
| `read` | Boolean | No | `false` | Set to `true` when the `messageRead` socket event is received |
| `createdAt` | Date | Auto | — | Timestamp when the message was created (Mongoose `timestamps`) |
| `updatedAt` | Date | Auto | — | Timestamp of the last update (Mongoose `timestamps`) |
| `__v` | Number | Auto | — | Mongoose internal version key |

Messages are stored with `timestamps: true` and queried with `.sort({ createdAt: 1 })` to return history in chronological order.

---

## 11. Error Handling and Validation

### Server-side (REST API)

- **Missing / empty `username`** → `400 Bad Request`
- **Missing / empty `text`** → `400 Bad Request`
- **Mongoose `ValidationError`** (e.g. max length exceeded) → `400 Bad Request` with the validation messages joined into a single string
- **Mongoose `CastError`** (invalid ObjectId) → `400 Bad Request` — `"Invalid ID format"`
- **Mongoose duplicate key (code 11000)** → `400 Bad Request` — `"Duplicate field value"`
- **Unhandled errors** → `500 Internal Server Error`
- **Unknown routes** → `404 Not Found` — `"Route not found"`

All error responses follow the shape: `{ "success": false, "message": "..." }`

### Server-side (Socket.io)

- Empty `username` on `userJoin` → silently ignored
- Empty / blank `text` on `sendMessage` → `messageError` event sent to sender
- `text` exceeding 500 characters → `messageError` event sent to sender
- MongoDB save failure → `messageError` event sent to sender

### Client-side (Frontend)

- Username under 2 characters → inline error displayed before navigation
- Username over 50 characters → inline error displayed (enforced by `maxLength` + validation)
- Network errors (ECONNREFUSED, ERR_NETWORK, no response) → user-friendly error messages via Axios response interceptor
- Socket connection errors → logged to console; reconnection attempted automatically (up to 10 times, 1 second delay)

---

## 12. Deployment

### Backend — Render

The backend is deployed as a **Node.js Web Service** on [Render](https://render.com) using the `render.yaml` configuration file at the repository root.

| Setting | Value |
|---|---|
| **Production URL** | https://realtime-chat-app-jhnx.onrender.com |
| **Root directory** | `backend/` |
| **Build command** | `npm install --omit=dev` |
| **Start command** | `npm start` |
| **Health check** | `GET /api/health` |
| **Auto-deploy** | Enabled (triggers on push to connected branch) |
| **WebSocket support** | Native on Render — no extra configuration required |

Environment variables (`MONGO_URI`, `CLIENT_URL`) are configured as secrets in the Render dashboard and are **not** stored in the repository. `PORT` is injected automatically by Render.

### Frontend — Expo Go (Development)

The React Native frontend runs via **Expo Go** on physical Android and iOS devices during development. It is not deployed as a standalone web application. The production backend URL is configured in `frontend/app.json`:

```json
"extra": {
  "BACKEND_URL": "https://realtime-chat-app-jhnx.onrender.com"
}
```

---

## 13. Testing

All tests below were performed manually against the production Render backend.

| Test | Method | Result |
|---|---|---|
| `GET /api/health` responds 200 | HTTP | ✅ PASS |
| `GET /api/messages` returns chat history | HTTP | ✅ PASS |
| `POST /api/messages` creates a message (201) | HTTP | ✅ PASS |
| POSTed message persists in MongoDB | HTTP (round-trip GET) | ✅ PASS |
| `POST /api/messages` with empty `username` → 400 | HTTP | ✅ PASS |
| `POST /api/messages` with empty `text` → 400 | HTTP | ✅ PASS |
| Socket.io connects and registers user | Two-device test | ✅ PASS |
| Real-time message delivery across two devices | Two-device test | ✅ PASS |
| Chat history loads on screen entry | Expo Go | ✅ PASS |
| Messages visible after reopening the app | Expo Go | ✅ PASS |
| Expo Go loads local Metro bundle without update errors | Expo Go | ✅ PASS |

> There are no automated tests (unit or integration). All verification was done manually.

---

## 14. Design Decisions

**Why Socket.io?**
Socket.io provides a reliable, bi-directional event-based communication layer over WebSockets with automatic polling fallback. It handles reconnection, room broadcasting, and cross-platform compatibility without additional infrastructure.

**Why REST APIs alongside Socket.io?**
Socket.io is stateful — it requires an active connection. The REST API provides a stateless, universally compatible interface for fetching chat history on screen load and for direct API access or debugging. Both layers write to the same MongoDB collection, keeping the data source unified.

**Why MongoDB?**
MongoDB's document model maps naturally to message objects (flexible fields, embedded objects). MongoDB Atlas provides a fully managed cloud database with no self-hosting overhead, which suits a project deployed on Render's free tier.

**Why a frontend / backend monorepo split?**
Separating the frontend and backend into distinct directories within the same repository allows them to be developed, versioned, and deployed independently. The backend can be redeployed without touching the frontend, and vice versa.

**Why environment variables?**
Credentials (MongoDB URI) and environment-specific configuration (CORS origin, port) are kept out of source code via `.env` files and platform secrets (Render dashboard). The `.env.example` file documents variable names without exposing values.

---

## 15. Environment Variables

These variables are required by the **backend**. Copy `backend/.env.example` to `backend/.env` and fill in your values. **Never commit `.env` to version control.**

| Variable | Purpose |
|---|---|
| `PORT` | The port the Express server listens on. Render injects this automatically in production — set to `5000` locally. |
| `MONGO_URI` | MongoDB Atlas connection string. Contains your cluster hostname, username, password, and database name. Set as a secret in the Render dashboard. |
| `CLIENT_URL` | Allowed CORS origin(s). Use `*` for mobile-only deployments. Use a comma-separated list for multiple web origins. Set as a secret in the Render dashboard. |
| `NODE_ENV` | Runtime environment. Set to `development` locally and `production` on Render. |

---

## 16. Future Improvements

The following are not currently implemented and represent potential future enhancements:

- **User authentication** — persistent accounts with passwords or OAuth (Google, GitHub)
- **Private one-to-one conversations** — dedicated chat rooms between two users
- **Push notifications** — notify users of new messages when the app is in the background
- **Image and file sharing** — send media attachments within the chat
- **More detailed read receipts** — per-user read tracking (e.g. "Seen by Alice, Bob")
- **Message reactions** — emoji reactions on individual messages
- **Message deletion or editing** — allow users to remove or modify sent messages
- **Pagination** — load older messages on demand rather than fetching the full history
- **Production monitoring** — integrate an observability tool (e.g. Sentry, Datadog)
- **Automated testing** — unit tests (Jest), integration tests, and end-to-end tests

---

## 17. Author

**Sujan S S**

GitHub: [https://github.com/sujansssujanss7-suj/Realtime-Chat-App](https://github.com/sujansssujanss7-suj/Realtime-Chat-App)
