/**
 * App-wide configuration
 *
 * URL resolution priority:
 *  1. app.json → extra.BACKEND_URL  (production — set this to your Render URL)
 *  2. DEV_BACKEND_URL constant below (local development fallback)
 *
 * To switch to your deployed backend:
 *  → Update app.json → extra.BACKEND_URL with your Render URL, e.g.:
 *    "https://realtime-chat-backend.onrender.com"
 *
 * To develop locally:
 *  → Update DEV_BACKEND_URL below to match your machine's local IP:
 *    - Physical device:     http://192.168.x.x:5000
 *    - Android Emulator:    http://10.0.2.2:5000
 *    - iOS Simulator:       http://localhost:5000
 */

import Constants from 'expo-constants';

// ── Local development URL ───────────────────────────────────────────────────
// Change this to your machine's local IP when developing without the deployed backend.
const DEV_BACKEND_URL = 'http://192.168.0.123:5000';

// ── Production URL (from app.json extra) ───────────────────────────────────
// Read the deployed backend URL injected at build time via app.json → extra.
const PROD_BACKEND_URL: string | undefined =
  Constants.expoConfig?.extra?.BACKEND_URL as string | undefined;

// Use production URL if it is set and not a placeholder; otherwise fall back to dev.
const isPlaceholder =
  !PROD_BACKEND_URL ||
  PROD_BACKEND_URL.includes('YOUR-SERVICE-NAME') ||
  PROD_BACKEND_URL.includes('YOUR-ACTUAL-RENDER-URL') ||
  PROD_BACKEND_URL.trim() === '';

export const BACKEND_URL: string = isPlaceholder ? DEV_BACKEND_URL : PROD_BACKEND_URL!;

// Both REST and Socket.io share the same base URL in this architecture.
export const API_BASE_URL = BACKEND_URL;
export const SOCKET_URL   = BACKEND_URL;

// ── Message constraints ─────────────────────────────────────────────────────
export const MAX_MESSAGE_LENGTH = 500;
export const MAX_USERNAME_LENGTH = 50;

// ── Typing indicator debounce delay (ms) ────────────────────────────────────
export const TYPING_DEBOUNCE_MS = 1000;

// ── Chat constants ──────────────────────────────────────────────────────────
export const MESSAGES_SORT_ORDER = 1; // ascending (oldest first)

// ── Socket.io reconnection ──────────────────────────────────────────────────
export const SOCKET_RECONNECTION_ATTEMPTS = 10;
export const SOCKET_RECONNECTION_DELAY    = 1000; // ms between reconnection attempts
