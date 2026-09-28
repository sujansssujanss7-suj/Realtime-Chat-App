import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
} from 'react-native';
import { MAX_MESSAGE_LENGTH, TYPING_DEBOUNCE_MS } from '../constants/config';
import { emitTyping, emitStopTyping } from '../services/socket';

interface ChatInputProps {
  username: string;
  onSend: (text: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ username, onSend, disabled = false }) => {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const handleTextChange = useCallback(
    (value: string) => {
      setText(value);

      if (!value.trim()) {
        // Stop typing if input is empty
        if (isTypingRef.current) {
          emitStopTyping(username);
          isTypingRef.current = false;
        }
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        return;
      }

      // Emit typing if not already doing so
      if (!isTypingRef.current) {
        emitTyping(username);
        isTypingRef.current = true;
      }

      // Reset the stop-typing debounce
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(username);
        isTypingRef.current = false;
      }, TYPING_DEBOUNCE_MS);
    },
    [username]
  );

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    // Stop typing indicator immediately on send
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    emitStopTyping(username);
    isTypingRef.current = false;

    onSend(trimmed);
    setText('');
  }, [text, disabled, username, onSend]);

  const canSend = text.trim().length > 0 && !disabled;
  const charCount = text.length;
  const isNearLimit = charCount > MAX_MESSAGE_LENGTH * 0.8;

  return (
    <View style={styles.wrapper}>
      {isNearLimit && (
        <Text style={[styles.charCount, charCount >= MAX_MESSAGE_LENGTH && styles.charCountOver]}>
          {charCount}/{MAX_MESSAGE_LENGTH}
        </Text>
      )}
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleTextChange}
          placeholder="Type a message..."
          placeholderTextColor="#5A6A7A"
          multiline
          maxLength={MAX_MESSAGE_LENGTH}
          returnKeyType="default"
          editable={!disabled}
          accessibilityLabel="Message input"
          accessibilityHint="Type your message here"
        />
        <TouchableOpacity
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.75}
          accessibilityLabel="Send message"
          accessibilityRole="button"
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 10,
    paddingTop: 8,
    backgroundColor: '#0D1B2A',
    borderTopWidth: 1,
    borderTopColor: '#1A2E44',
  },
  charCount: {
    fontSize: 11,
    color: '#7B8FA1',
    textAlign: 'right',
    marginBottom: 4,
    marginRight: 2,
  },
  charCountOver: {
    color: '#FF6B6B',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1E2A3A',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2A3F55',
    minHeight: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#E8ECF0',
    maxHeight: 120,
    paddingTop: Platform.OS === 'ios' ? 6 : 4,
    paddingBottom: Platform.OS === 'ios' ? 6 : 4,
    lineHeight: 21,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#2A3F55',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 2,
  },
});

export default ChatInput;
