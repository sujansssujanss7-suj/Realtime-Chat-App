# 💬 Real-Time Chat Application

A production-quality real-time chat application built with **React Native (Expo)**, **Node.js**, **Express**, **Socket.io**, and **MongoDB**.

---

## 📋 Overview

This application allows multiple users to connect, send and receive messages instantly using Socket.io WebSockets, and view persistent chat history stored in MongoDB. No page refreshes are needed — messages appear in real time for all connected clients.

---

## ✨ Features

| Feature | Status |
|---|---|
| Username login (dummy auth) | ✅ |
| Real-time messaging via Socket.io | ✅ |
| Persistent message history (MongoDB) | ✅ |
| Message timestamps | ✅ |
| Typing indicator | ✅ |
| Online/offline connection status | ✅ |
| Online user count | ✅ |
| Message delivery & read receipts | ✅ |
| User join/leave notifications | ✅ |
| Empty / loading / error states | ✅ |
| Input validation (frontend + backend) | ✅ |
| Character limit (500 chars) | ✅ |
| Keyboard-safe layout | ✅ |
| Centralized error handling | ✅ |

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native + Expo |
| Language | TypeScript |
| Navigation | Expo Router |
| HTTP Client | Axios |
| Real-time | Socket.io (client) |
| Backend Runtime | Node.js |
| Web Framework | Express.js |
| Real-time Server | Socket.io (server) |
| Database | MongoDB + Mongoose |
| Environment | dotenv |

---

## 📁 Project Structure

```
realtime-chat-app/
├── frontend/
│   ├── app/
│   │   ├── _layout.tsx        # Root layout (Expo Router)
│   │   ├── index.tsx          # Login / Username screen
│   │   └── chat.tsx           # Main chat screen
│   ├── components/
│   │   ├── MessageBubble.tsx  # Individual chat message
│   │   ├── ChatInput.tsx      # Message input + send button
│   │   ├── TypingIndicator.tsx # Animated typing dots
│   │   └── OnlineStatus.tsx   # Connection status badge
│   ├── services/
│   │   ├── api.ts             # Axios REST API service
│   │   └── socket.ts          # Socket.io client service
│   ├── constants/
│   │   └── config.ts          # App-wide configuration
│   ├── types/
│   │   └── chat.ts            # TypeScript interfaces
│   ├── package.json
│   ├── app.json
│   ├── tsconfig.json
│   └── babel.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          # MongoDB connection
│   │   ├── controllers/
│   │   │   └── messageController.js
│   │   ├── models/
│   │   │   └── Message.js     # Mongoose schema
│   │   ├── routes/
│   │   │   └── messageRoutes.js
│   │   ├── sockets/
│   │   │   └── chatSocket.js  # Socket.io event handlers
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   └── server.js          # Entry point
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- **MongoDB Atlas** account (free tier) or local MongoDB
- **Expo Go** app on your Android/iOS device, OR Android Emulator

---

## 🚀 Installation

### 1. Clone / Download the project

```bash
git clone <your-repo-url>
cd realtime-chat-app
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create the `.env` file (copy from example):

```bash
copy .env.example .env
```

Edit `.env` and set your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/realtime-chat?retryWrites=true&w=majority
CLIENT_URL=http://localhost:8081
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

You should see:

```
🚀 Server running at http://localhost:5000
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

> **Android Emulator note:** In `frontend/constants/config.ts`, change `localhost` to `10.0.2.2` for the Android Emulator to reach your local backend:
>
> ```ts
> export const API_BASE_URL = 'http://10.0.2.2:5000';
> export const SOCKET_URL = 'http://10.0.2.2:5000';
> ```
>
> **Physical Device note:** Use your machine's local IP (e.g. `192.168.1.x`).

Start the Expo dev server:

```bash
npx expo start
```

Scan the QR code with **Expo Go** (Android/iOS) or press `a` for Android Emulator.

---

## 🔐 Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:8081` |
| `NODE_ENV` | Environment mode | `development` |

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore`.

---

## 🍃 MongoDB Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a new **free cluster** (M0 tier).
3. Go to **Database Access** → Create a database user with a username and password.
4. Go to **Network Access** → Add `0.0.0.0/0` (allow all IPs) for development.
5. Go to your cluster → Click **Connect** → **Connect your application**.
6. Copy the connection string and replace `<username>`, `<password>`, and set the database name to `realtime-chat`.
7. Paste into your `.env` as `MONGO_URI`.

---

## ▶️ Running the Application

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

### Terminal 2 — Frontend

```bash
cd frontend
npx expo start
```

---

## 📡 REST API Documentation

### `GET /api/health`

Returns server status.

**Response:**
```json
{
  "status": "OK",
  "message": "Chat server is running"
}
```

---

### `GET /api/messages`

Fetches all chat history sorted chronologically (oldest first).

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "_id": "665f...",
      "username": "Sujan",
      "text": "Hello!",
      "delivered": true,
      "read": false,
      "createdAt": "2026-09-28T12:30:00.000Z",
      "updatedAt": "2026-09-28T12:30:00.000Z"
    }
  ]
}
```

---

### `POST /api/messages`

Creates a new message (REST fallback — real-time uses Socket.io).

**Request body:**
```json
{
  "username": "Sujan",
  "text": "Hello!"
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "_id": "665f...",
    "username": "Sujan",
    "text": "Hello!",
    "delivered": false,
    "read": false,
    "createdAt": "2026-09-28T12:30:00.000Z"
  }
}
```

**Validation errors (400):**
```json
{
  "success": false,
  "message": "Message text is required and cannot be empty"
}
```

---

## 🔌 Socket.io Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `userJoin` | `username: string` | Register user after connecting |
| `sendMessage` | `{ username, text }` | Send a new message |
| `typing` | `username: string` | Notify others user is typing |
| `stopTyping` | `username: string` | Notify others user stopped typing |
| `messageRead` | `{ messageId, username }` | Mark message as read |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `newMessage` | `Message` object | New message for all clients |
| `typing` | `{ username }` | Another user is typing |
| `stopTyping` | `{ username }` | User stopped typing |
| `userJoined` | `{ username, onlineCount }` | A user connected |
| `userLeft` | `{ username, onlineCount }` | A user disconnected |
| `onlineCount` | `{ count }` | Current online user count |
| `messageRead` | `{ messageId, username }` | Message was read |
| `messageError` | `{ message }` | Error occurred sending message |

---

## 🏗️ Architecture

### REST Flow (message history)

```
React Native App
      ↓ GET /api/messages (Axios)
Express REST API
      ↓ query
MongoDB (Mongoose)
      ↑ messages[]
React Native renders history
```

### Real-Time Flow (live messaging)

```
User types message → presses Send
      ↓
Socket.io emit: sendMessage
      ↓
Node.js Socket handler
      ↓ validates + saves
MongoDB
      ↓ savedMessage
Socket.io broadcast: newMessage → ALL clients
      ↓
Every connected client receives & renders instantly
```

---

## 💡 Design Decisions

**Why Socket.io?**
Socket.io provides reliable WebSocket communication with automatic fallback to HTTP long-polling. This guarantees instant message delivery without polling. It also supports rooms, acknowledgements, and reconnection out of the box.

**Why MongoDB?**
MongoDB's flexible document model is well-suited for chat messages. Messages are independent documents that don't require complex relational joins. Timestamps and schema validation are handled cleanly with Mongoose.

**Why separated frontend/backend?**
Keeping them separate enables independent scaling, deployment, and development. The backend can be deployed to any Node.js host, while the frontend can be built into an APK for Android distribution.

**Duplicate message prevention:**
Messages are sent exclusively via Socket.io `sendMessage`. The backend saves to MongoDB and broadcasts `newMessage` to all clients. The REST `POST /api/messages` endpoint exists for API completeness but is **not used** in the real-time flow, preventing duplicates.

---

## 🧾 Assumptions

- **No real authentication**: Username entry is a session-only dummy auth. There is no password, JWT, or user account.
- **Global chatroom**: All connected users share a single chat room. Private/group chats are not implemented.
- **No message pagination**: All messages are loaded at once. For large datasets, pagination should be added.

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| Backend not starting | Check `PORT` in `.env` and that port 5000 is free |
| MongoDB connection fails | Verify `MONGO_URI` in `.env`. Check Atlas Network Access allows your IP |
| Socket not connecting | Ensure backend is running on port 5000 |
| Android Emulator can't reach backend | Change `localhost` to `10.0.2.2` in `constants/config.ts` |
| Physical device can't reach backend | Use your PC's local IP (e.g. `192.168.1.x`) in `constants/config.ts` |
| Messages not persisting | Verify MongoDB write access. Check backend logs for errors |
| Expo not starting | Run `npm install` in the `frontend` folder |

---

## 🔮 Future Improvements

- Real authentication with JWT + bcrypt
- Private one-to-one messaging
- Group chat rooms
- Push notifications (Expo Notifications)
- Image / file sharing
- Message reactions (emoji)
- Message search
- Message pagination / infinite scroll
- User avatars / profile pictures
- Dark/light theme toggle
- E2E encryption

---

## 👨‍💻 Two-Client Test

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npx expo start`
3. Open **Expo Go** on two devices (or one device + one emulator)
4. On **Device 1**: Enter username `Sujan` → Join Chat
5. On **Device 2**: Enter username `Rahul` → Join Chat
6. **Sujan** types `"Hello Rahul"` → **Rahul** receives it instantly
7. **Rahul** replies `"Hi Sujan"` → **Sujan** receives it instantly
8. Close both apps and reopen — all messages are still there ✓
