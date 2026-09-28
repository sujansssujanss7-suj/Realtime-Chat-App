import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ConnectionStatus } from '../types/chat';

interface OnlineStatusProps {
  status: ConnectionStatus;
  onlineCount?: number;
}

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { dot: string; label: string; color: string; dotColor: string }
> = {
  connected: {
    dot: '🟢',
    label: 'Connected',
    color: '#4CAF50',
    dotColor: '#4CAF50',
  },
  disconnected: {
    dot: '⚫',
    label: 'Offline',
    color: '#7B8FA1',
    dotColor: '#546E7A',
  },
  reconnecting: {
    dot: '🔴',
    label: 'Reconnecting...',
    color: '#FF5722',
    dotColor: '#FF5722',
  },
  error: {
    dot: '🔴',
    label: 'Connection Error',
    color: '#FF5722',
    dotColor: '#FF5722',
  },
};

const OnlineStatus: React.FC<OnlineStatusProps> = ({ status, onlineCount }) => {
  const config = STATUS_CONFIG[status];

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: config.dotColor }]} />
      <Text style={[styles.label, { color: config.color }]}>
        {config.label}
        {status === 'connected' && onlineCount != null && onlineCount > 0
          ? ` · ${onlineCount} online`
          : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default OnlineStatus;
