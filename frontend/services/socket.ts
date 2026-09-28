import { io, Socket } from 'socket.io-client';
import {
  SOCKET_URL,
  SOCKET_RECONNECTION_ATTEMPTS,
  SOCKET_RECONNECTION_DELAY,
} from '../constants/config';
import {
  SendMessagePayload,
  NewMessagePayload,
  TypingPayload,
  UserJoinedPayload,
  UserLeftPayload,
  OnlineCountPayload,
  MessageReadPayload,
  MessageErrorPayload,
} from '../types/chat';

let socket: Socket | null = null;

/**
 * Connect to the Socket.io server and register the user
 */
export const connectSocket = (username: string): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: SOCKET_RECONNECTION_ATTEMPTS,
    reconnectionDelay: SOCKET_RECONNECTION_DELAY,
    timeout: 10000,
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id);
    // Register the user after connecting
    socket?.emit('userJoin', username);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
  });

  return socket;
};

/**
 * Disconnect the socket gracefully
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Emit a new message to the server
 */
export const sendMessage = (payload: SendMessagePayload): void => {
  if (!socket || !socket.connected) {
    console.warn('⚠️ Cannot send message: socket not connected');
    return;
  }
  socket.emit('sendMessage', payload);
};

/**
 * Listen for new incoming messages
 */
export const onNewMessage = (callback: (message: NewMessagePayload) => void): void => {
  socket?.on('newMessage', callback);
};

/**
 * Listen for typing events from other users
 */
export const onTyping = (callback: (data: TypingPayload) => void): void => {
  socket?.on('typing', callback);
};

/**
 * Listen for stopTyping events from other users
 */
export const onStopTyping = (callback: (data: TypingPayload) => void): void => {
  socket?.on('stopTyping', callback);
};

/**
 * Listen for when a user joins
 */
export const onUserJoined = (callback: (data: UserJoinedPayload) => void): void => {
  socket?.on('userJoined', callback);
};

/**
 * Listen for when a user leaves
 */
export const onUserLeft = (callback: (data: UserLeftPayload) => void): void => {
  socket?.on('userLeft', callback);
};

/**
 * Listen for online count updates
 */
export const onOnlineCount = (callback: (data: OnlineCountPayload) => void): void => {
  socket?.on('onlineCount', callback);
};

/**
 * Listen for message read receipts
 */
export const onMessageRead = (callback: (data: MessageReadPayload) => void): void => {
  socket?.on('messageRead', callback);
};

/**
 * Listen for message errors from the server
 */
export const onMessageError = (callback: (data: MessageErrorPayload) => void): void => {
  socket?.on('messageError', callback);
};

/**
 * Emit typing started event
 */
export const emitTyping = (username: string): void => {
  socket?.emit('typing', username);
};

/**
 * Emit typing stopped event
 */
export const emitStopTyping = (username: string): void => {
  socket?.emit('stopTyping', username);
};

/**
 * Emit that a message has been read
 */
export const emitMessageRead = (messageId: string, username: string): void => {
  socket?.emit('messageRead', { messageId, username });
};

/**
 * Listen for socket connection status changes
 */
export const onConnectionChange = (
  onConnect: () => void,
  onDisconnect: () => void,
  onReconnecting: () => void
): void => {
  socket?.on('connect', onConnect);
  socket?.on('disconnect', onDisconnect);
  socket?.io.on('reconnect_attempt', onReconnecting);
};

/**
 * Remove all listeners (call on screen unmount to prevent leaks)
 */
export const removeAllListeners = (): void => {
  socket?.removeAllListeners();
};

/**
 * Get the current socket instance
 */
export const getSocket = (): Socket | null => socket;
