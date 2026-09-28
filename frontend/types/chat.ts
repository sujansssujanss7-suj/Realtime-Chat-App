// Message type matching the MongoDB schema
export interface Message {
  _id: string;
  username: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  delivered: boolean;
  read: boolean;
}

// User type for session management
export interface User {
  username: string;
}

// Socket event payloads
export interface SendMessagePayload {
  username: string;
  text: string;
}

export interface NewMessagePayload extends Message {}

export interface TypingPayload {
  username: string;
}

export interface UserJoinedPayload {
  username: string;
  onlineCount: number;
}

export interface UserLeftPayload {
  username: string;
  onlineCount: number;
}

export interface OnlineCountPayload {
  count: number;
}

export interface MessageReadPayload {
  messageId: string;
  username: string;
}

export interface MessageErrorPayload {
  message: string;
}

// Connection status type
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'error';

// API response wrappers
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  messages?: T[];
}

export interface ApiMessageResponse {
  success: boolean;
  message: Message;
}
