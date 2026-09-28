import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MAX_USERNAME_LENGTH } from '../constants/config';

export default function IndexScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinChat = useCallback(async () => {
    const trimmed = username.trim();

    if (!trimmed) {
      setError('Please enter a username to continue.');
      return;
    }

    if (trimmed.length < 2) {
      setError('Username must be at least 2 characters.');
      return;
    }

    if (trimmed.length > MAX_USERNAME_LENGTH) {
      setError(`Username must be under ${MAX_USERNAME_LENGTH} characters.`);
      return;
    }

    setError('');
    setIsLoading(true);

    // Navigate to chat screen, passing username as a param
    setTimeout(() => {
      setIsLoading(false);
      router.push({
        pathname: '/chat',
        params: { username: trimmed },
      });
    }, 200);
  }, [username, router]);

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (error) setError('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Logo / Icon area */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>💬</Text>
          </View>
          <View style={styles.logoRing} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Real-Time Chat</Text>
        <Text style={styles.subtitle}>Connect and chat instantly.</Text>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={username}
            onChangeText={handleUsernameChange}
            placeholder="Enter your username"
            placeholderTextColor="#5A6A7A"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={MAX_USERNAME_LENGTH}
            returnKeyType="done"
            onSubmitEditing={handleJoinChat}
            accessibilityLabel="Username input"
            accessibilityHint="Enter a username to join the chat"
          />

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.joinButton, isLoading && styles.joinButtonLoading]}
            onPress={handleJoinChat}
            activeOpacity={0.8}
            disabled={isLoading}
            accessibilityLabel="Join Chat button"
            accessibilityRole="button"
          >
            <Text style={styles.joinButtonText}>
              {isLoading ? 'Joining...' : 'JOIN CHAT'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer note */}
        <Text style={styles.footerNote}>No account needed. Just a username.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  logoContainer: {
    width: 100,
    height: 100,
    marginBottom: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 12,
  },
  logoRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: 'rgba(108,99,255,0.3)',
  },
  logoEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7B8FA1',
    textAlign: 'center',
    marginBottom: 48,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  formContainer: {
    width: '100%',
    maxWidth: 380,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A0B4C4',
    marginBottom: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1E2A3A',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2A3F55',
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: '#E8ECF0',
    marginBottom: 12,
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255,107,107,0.06)',
  },
  errorContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  joinButtonLoading: {
    opacity: 0.7,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2,
  },
  footerNote: {
    marginTop: 32,
    fontSize: 13,
    color: '#3D5166',
    textAlign: 'center',
  },
});
