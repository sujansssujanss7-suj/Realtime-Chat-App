import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Message, ConnectionStatus } from '../types/chat';
import { fetchMessages } from '../services/api';
import {
  connectSocket,
  disconnectSocket,
  sendMessage as socketSendMessage,
  onNewMessage,
  onTyping,
  onStopTyping,
  onUserJoined,
  onUserLeft,
  onOnlineCount,
  onMessageRead,
  onMessageError,
  onConnectionChange,
  removeAllListeners,
  emitMessageRead,
} from '../services/socket';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import TypingIndicator from '../components/TypingIndicator';
import OnlineStatus from '../components/OnlineStatus';

export default function ChatScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList<Message>>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [sendError, setSendError] = useState<string | null>(null);

  // Scroll to bottom helper
  const scrollToBottom = useCallback((animated = true) => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated });
    }, 100);
  }, []);

  // Load message history via REST API
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const history = await fetchMessages();
      setMessages(history);
      scrollToBottom(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load messages.';
      setLoadError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [scrollToBottom]);

  // Setup Socket.io connection and all event listeners
  useEffect(() => {
    if (!username) return;

    const socket = connectSocket(username);

    // Connection status handlers
    onConnectionChange(
      () => setConnectionStatus('connected'),
      () => setConnectionStatus('disconnected'),
      () => setConnectionStatus('reconnecting')
    );

    // Set initial status based on socket state
    if (socket.connected) {
      setConnectionStatus('connected');
    }

    // New real-time message
    onNewMessage((message) => {
      setMessages((prev) => {
        // Prevent duplicates by _id
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
      scrollToBottom();

      // Emit read receipt for messages from others
      if (message.username !== username) {
        emitMessageRead(message._id, username);
      }
    });

    // Typing indicators (filter out own username)
    onTyping(({ username: typingUser }) => {
      if (typingUser === username) return;
      setTypingUsers((prev) =>
        prev.includes(typingUser) ? prev : [...prev, typingUser]
      );
    });

    onStopTyping(({ username: stoppedUser }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== stoppedUser));
    });

    // User presence
    onUserJoined(({ onlineCount: count }) => {
      setOnlineCount(count);
    });

    onUserLeft(({ onlineCount: count }) => {
      setOnlineCount(count);
    });

    onOnlineCount(({ count }) => {
      setOnlineCount(count);
    });

    // Message read receipts — update delivered messages
    onMessageRead(({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, read: true } : m))
      );
    });

    // Handle server-side message errors
    onMessageError(({ message: errMsg }) => {
      setSendError(errMsg);
      setTimeout(() => setSendError(null), 4000);
    });

    // Load chat history
    loadMessages();

    return () => {
      removeAllListeners();
      disconnectSocket();
    };
  }, [username, scrollToBottom, loadMessages]);

  // Handle sending a message via Socket.io
  const handleSend = useCallback(
    (text: string) => {
      if (!username || !text.trim()) return;
      setSendError(null);

      socketSendMessage({ username, text: text.trim() });
    },
    [username]
  );

  const handleBack = useCallback(() => {
    disconnectSocket();
    router.back();
  }, [router]);

  // --- Render helpers ---

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble message={item} isOwn={item.username === username} />
    ),
    [username]
  );

  const keyExtractor = useCallback((item: Message) => item._id, []);

  const renderEmptyState = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={styles.emptyTitle}>No messages yet</Text>
        <Text style={styles.emptySubtitle}>Start the conversation!</Text>
      </View>
    );
  };

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color="#6C63FF" />
      <Text style={styles.loadingText}>Loading messages...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Unable to load messages</Text>
      <Text style={styles.errorSubtitle}>{loadError}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadMessages} activeOpacity={0.8}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Real-Time Chat</Text>
          <OnlineStatus status={connectionStatus} onlineCount={onlineCount} />
        </View>

        <View style={styles.headerRight}>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarText}>
              {username ? username.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <Text style={styles.usernameLabel} numberOfLines={1}>
            {username}
          </Text>
        </View>
      </View>

      {/* Send error banner */}
      {sendError ? (
        <View style={styles.sendErrorBanner}>
          <Text style={styles.sendErrorText}>⚠️ {sendError}</Text>
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages area */}
        <View style={styles.messagesContainer}>
          {isLoading ? (
            renderLoadingState()
          ) : loadError ? (
            renderErrorState()
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={keyExtractor}
              ListEmptyComponent={renderEmptyState}
              contentContainerStyle={[
                styles.messageList,
                messages.length === 0 && styles.messageListEmpty,
              ]}
              onContentSizeChange={() => scrollToBottom(false)}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={Platform.OS === 'android'}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              maxToRenderPerBatch={10}
              windowSize={10}
            />
          )}
        </View>

        {/* Typing indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        {/* Chat input */}
        <ChatInput
          username={username ?? ''}
          onSend={handleSend}
          disabled={connectionStatus === 'disconnected'}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  flex: {
    flex: 1,
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#0D1B2A',
    borderBottomWidth: 1,
    borderBottomColor: '#1A2E44',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E2A3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  backIcon: {
    color: '#E8ECF0',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
  },
  headerCenter: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerRight: {
    alignItems: 'center',
    gap: 3,
    marginLeft: 8,
    maxWidth: 72,
  },
  avatarBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  usernameLabel: {
    fontSize: 10,
    color: '#7B8FA1',
    fontWeight: '500',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  // --- Send error ---
  sendErrorBanner: {
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,107,107,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sendErrorText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  // --- Messages ---
  messagesContainer: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  messageList: {
    paddingVertical: 12,
  },
  messageListEmpty: {
    flex: 1,
  },
  // --- Empty state ---
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E8ECF0',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7B8FA1',
    textAlign: 'center',
  },
  // --- Loading state ---
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#7B8FA1',
    fontSize: 15,
    fontWeight: '500',
  },
  // --- Error state ---
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E8ECF0',
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 13,
    color: '#7B8FA1',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    backgroundColor: '#6C63FF',
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
